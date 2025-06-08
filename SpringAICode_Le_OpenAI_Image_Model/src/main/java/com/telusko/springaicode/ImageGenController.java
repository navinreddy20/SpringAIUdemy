package com.telusko.springaicode;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.openai.OpenAiImageModel;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ImageGenController {

    private ChatClient chatClient;

    private OpenAiImageModel openAiImageModel;

    public ImageGenController(OpenAiImageModel openAiImageModel, ChatClient.Builder builder) {
        this.openAiImageModel = openAiImageModel;
        this.chatClient = builder
                .build();

    }
}
