package com.example.demo.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.*;

@Controller
public class ApiExplorerController {

    private final ObjectMapper mapper = new ObjectMapper();

    @GetMapping("/")
    public String home() {
        return "index";
    }

    @PostMapping("/fetch-api-docs")
    @ResponseBody
    public ResponseEntity<?> fetchApiDocs(@RequestBody Map<String, String> request) {
        try {
            String baseUrl = request.get("baseUrl");
            HttpClient client = HttpClient.newHttpClient();
            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create(baseUrl + "/v3/api-docs"))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(httpRequest, HttpResponse.BodyHandlers.ofString());
            JsonNode jsonNode = mapper.readTree(response.body());
            return ResponseEntity.ok(jsonNode);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Error: " + e.getMessage());
        }
    }

    @PostMapping("/send-request")
    @ResponseBody
    public ResponseEntity<?> sendRequest(@RequestBody Map<String, Object> input) {
        try {
            String url = (String) input.get("url");
            String method = (String) input.get("method");
            String body = (String) input.get("body");
            Map<String, String> headers = (Map<String, String>) input.get("headers");

            HttpRequest.Builder builder = HttpRequest.newBuilder().uri(URI.create(url));
            headers.forEach(builder::header);

            if ("GET".equalsIgnoreCase(method) || "DELETE".equalsIgnoreCase(method)) {
                builder.method(method, HttpRequest.BodyPublishers.noBody());
            } else {
                builder.method(method, HttpRequest.BodyPublishers.ofString(body != null ? body : ""));
            }

            HttpClient client = HttpClient.newHttpClient();
            HttpResponse<String> response = client.send(builder.build(), HttpResponse.BodyHandlers.ofString());

            Map<String, Object> result = new HashMap<>();
            result.put("status", response.statusCode());
            result.put("body", response.body());

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Request failed: " + e.getMessage());
        }
    }
}
