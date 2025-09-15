class MercadoPagoService:
    def __init__(self):
        self.token = "demo_token"

    def create_payment(self, amount: float, description: str):
        # Demo implementation
        return {"id": "demo_payment_123", "status": "approved", "amount": amount}