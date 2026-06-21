package com.auction.api.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerifyAuctionRequest {
    @NotBlank(message = "Verification status is required")
    private String verificationStatus;

    private String verificationNotes;
}
