import re
with open('C:\\ALL FINAL PROJECTS\\BOTS\\PAYMENT BOT\\src\\api\\routes\\payment.routes.js', 'r', encoding='utf-8') as f:
    text = f.read()

def replacer(match):
    return '''
          const sub = await grantSubscription({
            telegramId: order.telegramId,
            platformId: order.platformId,
            planId: order.planId,
            orderId: order.orderId,
          });
          
          // Generate Claim Ticket for Ecosystem Setup
          const ticketId = UNV--;
          const newTicket = new Ticket({
            ticketId,
            telegramId: order.telegramId,
            platformId: order.platformId,
            planId: order.planId,
            orderId: order.orderId,
          });
          await newTicket.save();

          const { sendPaymentReceipt } = await import('../../services/notify.service.js');
          await sendPaymentReceipt({
            telegramId: order.telegramId,
            orderId: order.orderId,
            platformId: order.platformId,
            planId: order.planId,
            amount: order.amount,
            expiresAt: sub.expiresAt,
            ticketId: ticketId
          });
'''

pattern = r'const sub = await grantSubscription\(\{[\s\S]*?ticketId:\s*\'\'\s*\}\);\s*(?:await\s+sendPaymentReceipt\(\{[\s\S]*?\}\);)?'
if 'ticketId = UNV' not in text:
    text = re.sub(pattern, replacer, text)
    if 'import { Ticket }' not in text:
        text = text.replace("import { Order } from '../../db/models/Order.js';", "import { Order } from '../../db/models/Order.js';\nimport { Ticket } from '../../db/models/Ticket.js';")
    with open('C:\\ALL FINAL PROJECTS\\BOTS\\PAYMENT BOT\\src\\api\\routes\\payment.routes.js', 'w', encoding='utf-8') as f:
        f.write(text)
    print('payment.routes.js patched')
else:
    print('Already patched')
