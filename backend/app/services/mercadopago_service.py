import mercadopago
from typing import Dict, Any, Optional
from ..config import settings
from ..models.pagamento import TipoPagamento, StatusPagamento
from datetime import datetime

class MercadoPagoService:
    def __init__(self):
        self.sdk = mercadopago.SDK(settings.mercado_pago_access_token)
    
    def criar_pagamento(self, valor: float, descricao: str, 
                       email_pagador: str, tipo_pagamento: TipoPagamento,
                       external_reference: str) -> Dict[str, Any]:
        """Cria um pagamento no Mercado Pago"""
        
        try:
            # Configurar dados do pagamento
            payment_data = {
                "transaction_amount": valor,
                "description": descricao,
                "payment_method_id": self._get_payment_method_id(tipo_pagamento),
                "payer": {
                    "email": email_pagador
                },
                "external_reference": external_reference,
                "notification_url": f"{settings.cors_origins[0]}/api/webhooks/mercadopago",
                "back_urls": {
                    "success": f"{settings.cors_origins[0]}/dashboard/pagamento/sucesso",
                    "failure": f"{settings.cors_origins[0]}/dashboard/pagamento/falha",
                    "pending": f"{settings.cors_origins[0]}/dashboard/pagamento/pendente"
                }
            }
            
            # Criar pagamento
            payment_response = self.sdk.payment().create(payment_data)
            
            if payment_response["status"] == 201:
                payment = payment_response["response"]
                return {
                    "success": True,
                    "payment_id": payment["id"],
                    "status": payment["status"],
                    "init_point": payment.get("init_point"),
                    "sandbox_init_point": payment.get("sandbox_init_point"),
                    "payment_data": payment
                }
            else:
                return {
                    "success": False,
                    "error": payment_response.get("message", "Erro ao criar pagamento"),
                    "response": payment_response
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def obter_pagamento(self, payment_id: str) -> Dict[str, Any]:
        """Obtém informações de um pagamento específico"""
        try:
            payment_response = self.sdk.payment().get(payment_id)
            
            if payment_response["status"] == 200:
                payment = payment_response["response"]
                return {
                    "success": True,
                    "payment": payment
                }
            else:
                return {
                    "success": False,
                    "error": payment_response.get("message", "Erro ao obter pagamento")
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def processar_webhook(self, webhook_data: Dict[str, Any]) -> Dict[str, Any]:
        """Processa webhook do Mercado Pago"""
        try:
            if webhook_data.get("type") == "payment":
                payment_id = webhook_data["data"]["id"]
                payment_info = self.obter_pagamento(str(payment_id))
                
                if payment_info["success"]:
                    payment = payment_info["payment"]
                    
                    # Mapear status do Mercado Pago para nosso enum
                    status_mapping = {
                        "approved": StatusPagamento.APROVADO,
                        "rejected": StatusPagamento.REJEITADO,
                        "cancelled": StatusPagamento.CANCELADO,
                        "pending": StatusPagamento.PENDENTE,
                        "in_process": StatusPagamento.PENDENTE,
                        "refunded": StatusPagamento.ESTORNADO
                    }
                    
                    return {
                        "success": True,
                        "payment_id": payment_id,
                        "status": status_mapping.get(payment["status"], StatusPagamento.PENDENTE),
                        "external_reference": payment.get("external_reference"),
                        "payment_data": payment
                    }
            
            return {
                "success": False,
                "error": "Webhook não processado"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def _get_payment_method_id(self, tipo_pagamento: TipoPagamento) -> str:
        """Mapeia nosso tipo de pagamento para o ID do Mercado Pago"""
        mapping = {
            TipoPagamento.CARTAO_CREDITO: "visa",
            TipoPagamento.CARTAO_DEBITO: "visa",
            TipoPagamento.PIX: "pix",
            TipoPagamento.BOLETO: "bolbradesco"
        }
        return mapping.get(tipo_pagamento, "visa")
    
    def criar_preferencia(self, items: list, external_reference: str) -> Dict[str, Any]:
        """Cria uma preferência de pagamento (para checkout mais avançado)"""
        try:
            preference_data = {
                "items": items,
                "external_reference": external_reference,
                "notification_url": f"{settings.cors_origins[0]}/api/webhooks/mercadopago",
                "back_urls": {
                    "success": f"{settings.cors_origins[0]}/dashboard/pagamento/sucesso",
                    "failure": f"{settings.cors_origins[0]}/dashboard/pagamento/falha",
                    "pending": f"{settings.cors_origins[0]}/dashboard/pagamento/pendente"
                }
            }
            
            preference_response = self.sdk.preference().create(preference_data)
            
            if preference_response["status"] == 201:
                preference = preference_response["response"]
                return {
                    "success": True,
                    "preference_id": preference["id"],
                    "init_point": preference["init_point"],
                    "sandbox_init_point": preference["sandbox_init_point"]
                }
            else:
                return {
                    "success": False,
                    "error": preference_response.get("message", "Erro ao criar preferência")
                }
                
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            } 