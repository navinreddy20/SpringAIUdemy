package com.telusko.SpringEcom.model.dto;

public record OrderItemRequest(
        int productId,
        int quantity
) {}
