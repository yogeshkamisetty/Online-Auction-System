package com.auction.api.dto;

import com.auction.api.entity.Role;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private String id;
    private String name;
    private String email;
    private Role role;
}
