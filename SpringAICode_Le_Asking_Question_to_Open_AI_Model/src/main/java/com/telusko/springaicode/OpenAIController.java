package com.telusko.springaicode;

import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class OpenAIController {
    private OpenAiChatModel chatModel;

    public OpenAIController(OpenAiChatModel chatModel) {
        this.chatModel = chatModel;
    }


    @GetMapping("/api/{message}")
    public String getAnswer(@PathVariable String message) {
        String response = chatModel.call(message);

        return response;
    }
}

