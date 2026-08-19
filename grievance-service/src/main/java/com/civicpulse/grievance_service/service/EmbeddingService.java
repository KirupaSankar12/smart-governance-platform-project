package com.civicpulse.grievance_service.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;

/**
 * Generates text embedding vectors for semantic duplicate detection.
 *
 * <p>Primary provider: Google Gemini Embedding API (gemini-embedding-001, 3072-dim)
 * <p>Fallback: Local 128-dimensional character/word N-gram hash vectorizer.
 *
 * <p>The provider used for each embedding is recorded via {@link EmbeddingResult#source}
 * so callers can persist the model metadata and avoid cross-dimension cosine comparisons.
 *
 * <p>Embedding source constants:
 * <ul>
 *   <li>{@link #SOURCE_GEMINI} — Gemini API embedding (high quality, semantically aware)</li>
 *   <li>{@link #SOURCE_LOCAL}  — Local N-gram fallback (keyword overlap only)</li>
 * </ul>
 */
@Service
public class EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);

    /** Embedding source label for the Gemini API provider. */
    public static final String SOURCE_GEMINI = "GEMINI_EMBEDDING_001";

    /** Embedding source label for the local N-gram fallback. */
    public static final String SOURCE_LOCAL = "LOCAL_NGRAM";

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.embedding.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent}")
    private String embeddingUrl;

    // The model name is sent in the request body (required by the Gemini embedContent API).
    @Value("${gemini.embedding.model:gemini-embedding-001}")
    private String embeddingModel;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    public EmbeddingService() {
        this.restClient = RestClient.create();
        this.objectMapper = new ObjectMapper();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PUBLIC API
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Immutable result container carrying both the embedding vector and the source label.
     *
     * @param vector the float embedding array
     * @param source {@link #SOURCE_GEMINI} or {@link #SOURCE_LOCAL}
     */
    public record EmbeddingResult(float[] vector, String source) {}

    /**
     * Generates an embedding for the given text and returns both the vector and the source label.
     * Use this when you need to persist the embedding model metadata alongside the vector.
     *
     * @param text the text to embed (typically title + " " + description)
     * @return {@link EmbeddingResult} — never null; falls back to local N-gram if Gemini fails
     */
    public EmbeddingResult getEmbeddingWithSource(String text) {
        if (text == null || text.isBlank()) {
            return new EmbeddingResult(new float[0], SOURCE_LOCAL);
        }

        if (apiKey != null && !apiKey.isBlank()) {
            try {
                float[] geminiVector = callGeminiEmbeddingApi(text);
                if (geminiVector != null && geminiVector.length > 0) {
                    log.info("[Embedding] Provider=GEMINI model={} dim={} text_preview=\"{}\"",
                            embeddingModel, geminiVector.length,
                            text.length() > 60 ? text.substring(0, 60) + "…" : text);
                    return new EmbeddingResult(geminiVector, SOURCE_GEMINI);
                }
            } catch (Exception e) {
                log.warn("[Embedding] Gemini API call failed ({}), using LOCAL_NGRAM fallback. Error: {}",
                        embeddingModel, e.getMessage());
            }
        } else {
            log.debug("[Embedding] GEMINI_API_KEY not set — using LOCAL_NGRAM fallback.");
        }

        float[] localVector = generateLocalNgramEmbedding(text);
        log.info("[Embedding] Provider=LOCAL_NGRAM dim={} text_preview=\"{}\"",
                localVector.length,
                text.length() > 60 ? text.substring(0, 60) + "…" : text);
        return new EmbeddingResult(localVector, SOURCE_LOCAL);
    }

    /**
     * Convenience method — returns the raw float array only.
     * Use {@link #getEmbeddingWithSource(String)} when you need to persist the source label.
     */
    public float[] getEmbedding(String text) {
        return getEmbeddingWithSource(text).vector();
    }

    /**
     * Serializes a float array to JSON string for DB storage.
     */
    public String toJson(float[] vector) {
        try {
            return objectMapper.writeValueAsString(vector);
        } catch (Exception e) {
            log.error("[Embedding] Failed to serialize vector to JSON", e);
            return "[]";
        }
    }

    /**
     * Deserializes a JSON string to a float array.
     */
    public float[] fromJson(String json) {
        if (json == null || json.isBlank()) return new float[0];
        try {
            List<Float> list = objectMapper.readValue(json, new TypeReference<List<Float>>() {});
            float[] res = new float[list.size()];
            for (int i = 0; i < list.size(); i++) {
                res[i] = list.get(i);
            }
            return res;
        } catch (Exception e) {
            log.error("[Embedding] Failed to deserialize vector from JSON", e);
            return new float[0];
        }
    }

    /**
     * Calculates cosine similarity between two float vectors.
     * Returns 0.0 if vectors are empty or have different dimensions —
     * cross-dimension comparison is meaningless and must be avoided.
     */
    public double calculateCosineSimilarity(float[] vecA, float[] vecB) {
        if (vecA == null || vecB == null || vecA.length == 0 || vecB.length == 0) {
            return 0.0;
        }

        if (vecA.length != vecB.length) {
            // Dimension mismatch — vectors come from different models (e.g. 3072-dim Gemini vs 128-dim local).
            // Cosine on incompatible spaces produces garbage. Return 0 and let text-similarity handle it.
            log.debug("[Embedding] Dimension mismatch: vecA={} vecB={} — skipping cosine, using text similarity.",
                    vecA.length, vecB.length);
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vecA.length; i++) {
            dotProduct += vecA[i] * vecB[i];
            normA += vecA[i] * vecA[i];
            normB += vecB[i] * vecB[i];
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        double similarity = dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
        return Math.max(0.0, Math.min(1.0, similarity));
    }

    /**
     * Calculates direct text semantic similarity combining token Jaccard and character N-Gram overlap.
     * Used as a fallback when stored vector dimensions do not match the incoming vector.
     */
    public double calculateTextSimilarity(String text1, String text2) {
        if (text1 == null || text2 == null) return 0.0;
        String t1 = text1.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").trim();
        String t2 = text2.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").trim();

        if (t1.equals(t2)) return 1.0;
        if (t1.isEmpty() || t2.isEmpty()) return 0.0;

        // Token Jaccard
        Set<String> words1 = new HashSet<>(Arrays.asList(t1.split("\\s+")));
        Set<String> words2 = new HashSet<>(Arrays.asList(t2.split("\\s+")));
        Set<String> intersection = new HashSet<>(words1);
        intersection.retainAll(words2);
        Set<String> union = new HashSet<>(words1);
        union.addAll(words2);
        double jaccard = union.isEmpty() ? 0.0 : (double) intersection.size() / union.size();

        // Cosine on local N-Gram embeddings
        float[] v1 = generateLocalNgramEmbedding(t1);
        float[] v2 = generateLocalNgramEmbedding(t2);
        double cosine = calculateCosineSimilarity(v1, v2);

        return (0.4 * jaccard) + (0.6 * cosine);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRIVATE HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Calls the Gemini Embedding API.
     * The model name is injected from {@code gemini.embedding.model} in application.properties.
     */
    private float[] callGeminiEmbeddingApi(String text) {
        String fullUrl = embeddingUrl + "?key=" + apiKey;

        // The "model" field in the request body must match the model in the URL path.
        Map<String, Object> body = Map.of(
            "model", "models/" + embeddingModel,
            "content", Map.of(
                "parts", List.of(Map.of("text", text))
            )
        );

        String rawResponse = restClient.post()
            .uri(fullUrl)
            .header("Content-Type", "application/json")
            .body(body)
            .retrieve()
            .body(String.class);

        if (rawResponse == null) return null;

        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode valuesNode = root.path("embedding").path("values");

            if (valuesNode.isArray() && valuesNode.size() > 0) {
                float[] embedding = new float[valuesNode.size()];
                for (int i = 0; i < valuesNode.size(); i++) {
                    embedding[i] = (float) valuesNode.get(i).asDouble();
                }
                return embedding;
            }
        } catch (Exception e) {
            log.error("[Embedding] Error parsing Gemini embedding response", e);
        }

        return null;
    }

    /**
     * Local 128-dimensional character & word N-gram feature hasher vectorizer.
     * Guarantees fast, robust, zero-dependency offline semantic vector representation.
     * Used when the Gemini API is unavailable or the API key is not configured.
     */
    private float[] generateLocalNgramEmbedding(String text) {
        int dim = 128;
        float[] vector = new float[dim];
        if (text == null || text.isBlank()) return vector;

        String normalized = text.toLowerCase().replaceAll("[^a-z0-9\\s]", " ").trim();
        String[] words = normalized.split("\\s+");

        // 1. Word unigrams & bigrams
        for (int i = 0; i < words.length; i++) {
            String word = words[i];
            if (!word.isBlank()) {
                int hash1 = Math.abs(word.hashCode()) % dim;
                vector[hash1] += 1.0f;

                if (i < words.length - 1) {
                    String bigram = word + "_" + words[i + 1];
                    int hash2 = Math.abs(bigram.hashCode()) % dim;
                    vector[hash2] += 1.5f;
                }
            }
        }

        // 2. Character trigrams for typo tolerance
        for (int i = 0; i < normalized.length() - 2; i++) {
            String tri = normalized.substring(i, i + 3);
            int hash3 = Math.abs(tri.hashCode()) % dim;
            vector[hash3] += 0.5f;
        }

        // L2 normalize
        float norm = 0.0f;
        for (float val : vector) {
            norm += val * val;
        }
        if (norm > 0) {
            float sqrtNorm = (float) Math.sqrt(norm);
            for (int i = 0; i < dim; i++) {
                vector[i] /= sqrtNorm;
            }
        }

        return vector;
    }
}
