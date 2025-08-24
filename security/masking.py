SENSITIVE_KEYS = {
    "password","confirm_password","password_hash","hashed_password",
    "salt","secret","api_key","apikey","access_token","refresh_token","token",
}

def mask_sensitive(obj):
    if isinstance(obj, dict):
        return {k: ("***" if k.lower() in SENSITIVE_KEYS else mask_sensitive(v))
                for k, v in obj.items()}
    if isinstance(obj, list):
        return [mask_sensitive(v) for v in obj]
    return obj