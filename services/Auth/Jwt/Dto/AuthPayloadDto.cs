﻿using Jwt.Dto;

namespace Auth.Dto
{
    public class AuthPayloadDto
    {
        public string Token { get; set; } = string.Empty;
        public UserClaimsDto User { get; set; } = default!;
    }
}
