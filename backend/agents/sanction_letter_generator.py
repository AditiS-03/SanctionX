from fpdf import FPDF
from datetime import date
import os

def generate_sanction_letter(profile):
    pdf = FPDF()
    pdf.add_page()

    pdf.set_font("Arial", size=12)

    pdf.cell(200, 10, txt="SANCTION LETTER", ln=True, align="C")
    pdf.ln(10)

    today = date.today().strftime("%d-%m-%Y")

    pdf.cell(200, 10, txt=f"Date: {today}", ln=True)
    pdf.ln(5)

    pdf.multi_cell(0, 8, txt=f"""
Dear {profile.get("name", "Applicant")},

We are pleased to inform you that your loan application has been approved.

Loan Details:
--------------------------------
Loan Amount: ₹{profile["final_offer"]["amount"]}
Interest Rate: {profile["final_offer"]["rate"]}% per annum
Tenure: {profile["final_offer"]["months"]} months
EMI: ₹{profile["final_offer"]["emi"]}

Purpose: {profile.get("loan_type", "N/A")}

--------------------------------

Please visit your closest bank branch for disbursement of the loan amount.

This sanction is subject to verification of original documents.

Regards,
SanctionX Loan Processing System
    """)

    filename = f"sanction_letter_{profile.get('name','user')}.pdf"
    filepath = os.path.join("sanction_letters", filename)

    os.makedirs("sanction_letters", exist_ok=True)
    pdf.output(filepath)

    return filepath
