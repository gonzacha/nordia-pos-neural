class WhatsAppService:
    def __init__(self):
        self.token = "demo_token"

    def send_message(self, phone: str, message: str):
        # Demo implementation
        print(f"WhatsApp to {phone}: {message}")
        return True