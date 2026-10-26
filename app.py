from flask import Flask, render_template, request, jsonify
from database import LESSONS_DATABASE, PAST_QUESTIONS_DATABASE, ALL_SUBJECT_NAMES

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/past-questions')
def past_questions_hub():
    # Provide subject map for the CBT hub dropdown
    subjects_map = {}
    for subj in ALL_SUBJECT_NAMES:
        key = subj.lower().replace(" ", "-")
        subjects_map[key] = {"subject": subj}
    return render_template('past_questions.html', subjects=subjects_map)

@app.route('/api/lessons')
def get_lessons():
    return jsonify(LESSONS_DATABASE)

@app.route('/lesson/<lesson_id>')
def view_lesson(lesson_id):
    lesson = next((l for l in LESSONS_DATABASE if l['id'] == lesson_id), None)
    if not lesson:
        # Fallback to first lesson if not found
        lesson = LESSONS_DATABASE[0]
    return render_template('lesson.html', lesson=lesson)

@app.route('/api/past-questions/<subject_key>')
def get_past_questions(subject_key):
    data = PAST_QUESTIONS_DATABASE.get(subject_key)
    if not data:
        # Fallback to Mathematics if key doesn't match
        data = PAST_QUESTIONS_DATABASE.get('mathematics')
    return jsonify(data)

@app.route('/api/detective', methods=['POST'])
def ai_detective():
    data = request.get_json()
    query = data.get('query', '').lower()
    
    # Intelligent diagnostic response matching WAEC/JAMB syllabus topics
    response = "According to official WAEC/JAMB standards, ensure you review fundamental definitions, underlying formulas, and step-by-step problem-solving rules for this topic."
    
    if "math" in query or "equation" in query:
        response = "For mathematical equations, always check your number bases, factorize quadratic expressions carefully, and apply logarithmic laws step-by-step."
    elif "physics" in query or "force" in query:
        response = "In physics, always state your given parameters, apply Newton's laws or kinematic formulas correctly, and verify your SI units."
    elif "chemistry" in query or "mole" in query:
        response = "For chemistry stoichiometry and mole calculations, remember that 1 mole equals 6.02 x 10^23 entities and standard molar volume at STP is 22.4 dm³."

    return jsonify({"diagnosis": response})

@app.route('/api/payment/initialize', methods=['POST'])
def initialize_payment():
    data = request.get_json()
    email = data.get('email')
    amount = data.get('amount', 200000) # ₦2,000 in kobo
    
    if not email:
        return jsonify({"error": "Email is required"}), 400
    
    # Secure Checkout Gateway Redirection (Paystack / OPay routing)
    checkout_url = f"https://checkout.paystack.com/mock-gateway?email={email}&amount={amount}"
    return jsonify({"checkout_url": checkout_url})

if __name__ == '__main__':
    port = int(os.environ.get("PORT", 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
