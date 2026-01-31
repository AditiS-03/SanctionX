from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas

def generate_sanction_letter(session):
    name = session["profile"].get("name", "Customer")
    amount = session["profile"].get("approved_amount", 0)
    emi = session["profile"].get("emi", 0)

    file_path = "sanction_letter.pdf"
    c = canvas.Canvas(file_path, pagesize=letter)

    c.drawString(100, 750, "SANCTION LETTER - SANCTIONX")
    c.drawString(100, 720, f"Dear {name},")
    c.drawString(100, 690, f"We are pleased to sanction your loan of ₹{amount}.")
    c.drawString(100, 660, f"Your EMI is ₹{emi}.")
    c.drawString(100, 630, "Thank you for choosing SanctionX.")

    c.save()
    return file_path
