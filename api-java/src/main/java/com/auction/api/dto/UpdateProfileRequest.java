package com.auction.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {
    @NotBlank(message = "Name is required")
    private String name;

    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}
