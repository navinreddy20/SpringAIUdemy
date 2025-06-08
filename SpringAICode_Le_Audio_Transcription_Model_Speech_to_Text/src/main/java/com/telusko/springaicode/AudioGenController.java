package com.telusko.springaicode;

import org.springframework.ai.openai.OpenAiAudioTranscriptionModel;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AudioGenController {

    private OpenAiAudioTranscriptionModel audioModel;

    public AudioGenController(OpenAiAudioTranscriptionModel audioModel) {
        this.audioModel = audioModel;
    }


    @PostMapping("api/stt")
    public String speechToText() {

        return "";
    }


}
