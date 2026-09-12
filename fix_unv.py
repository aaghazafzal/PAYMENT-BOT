import re

with open('C:\\ALL FINAL PROJECTS\\BOTS\\PAYMENT BOT\\src\\api\\routes\\payment.routes.js', 'r', encoding='utf-8') as f:
    text = f.read()

replacement = "UNV--"
text = text.replace("ticketId = UNV--;", f"ticketId = {replacement};")

with open('C:\\ALL FINAL PROJECTS\\BOTS\\PAYMENT BOT\\src\\api\\routes\\payment.routes.js', 'w', encoding='utf-8') as f:
    f.write(text)

print("Fixed UNV-- syntax error")
