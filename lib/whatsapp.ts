// Funciones para interactuar con la API oficial de WhatsApp Business de Meta

const WHATSAPP_API_URL = "https://graph.facebook.com/v20.0"

// Envía un mensaje de texto a un número de WhatsApp
export async function sendWhatsAppMessage({
  to,
  message,
  phoneNumberId,
  accessToken,
}: {
  to: string          // Número destino: "5215512345678"
  message: string     // Texto a enviar
  phoneNumberId: string  // ID del número de Meta
  accessToken: string    // Token de acceso de Meta
}) {
  const response = await fetch(
    `${WHATSAPP_API_URL}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type":  "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: message },
      }),
    }
  )

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Error de WhatsApp API: ${JSON.stringify(error)}`)
  }

  return response.json()
}

// Marca un mensaje como leído (palomitas azules)
export async function markAsRead({
  messageId,
  phoneNumberId,
  accessToken,
}: {
  messageId: string
  phoneNumberId: string
  accessToken: string
}) {
  await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${accessToken}`,
      "Content-Type":  "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      status: "read",
      message_id: messageId,
    }),
  })
}
