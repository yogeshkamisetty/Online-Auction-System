package com.auction.api.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAuctionRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    private String condition;

    private String imageUrl;

    @NotNull(message = "Start price is required")
    @DecimalMin(value = "0.01", message = "Start price must be greater than 0")
    private BigDecimal startPrice;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;
}
