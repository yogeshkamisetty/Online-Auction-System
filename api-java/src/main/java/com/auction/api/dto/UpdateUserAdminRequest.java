package com.auction.api.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateUserAdminRequest {
    private Boolean suspended;
    private String role;
}
