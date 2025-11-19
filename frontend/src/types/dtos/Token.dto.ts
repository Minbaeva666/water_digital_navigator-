import {TokenType} from "../constants/enums.ts";

export interface TokenDto {
    id: string;
    token: string;
    tokenTyp: TokenType;
    expiresAt: string;
    userId: string;
}
