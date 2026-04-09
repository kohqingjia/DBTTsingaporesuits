"""
Generate a realistic reviews_dataset.csv for Picadilly Tailors.
Run once: python generate_dataset.py
"""
import csv
import random
from datetime import datetime, timedelta
from pathlib import Path

random.seed(42)

OUTPUT = Path(__file__).parent / "reviews_dataset.csv"

# ─── Review templates by sentiment ───────────────────────────────────────────

FIVE_STAR = [
    "Absolutely stunning craftsmanship. Suresh and the team at Picadilly Tailors created the most perfectly fitted suit I have ever worn. The fabric quality is exceptional and every detail is immaculate.",
    "I ordered a bespoke wedding suit and was blown away by the quality. The fit is perfect, the fabric beautiful, and Suresh's expertise is unmatched. Highly recommend to anyone.",
    "Exceptional service from start to finish. The tailored suit fits like a second skin. The lining detail and hand stitching are remarkable. Worth every dollar spent.",
    "The best tailoring experience in Singapore without question. My bespoke suit for the black tie event drew so many compliments. The fabric drape and silhouette are perfection.",
    "Outstanding quality and attention to detail. Suresh took the time to understand exactly what I needed for my wedding. The final suit exceeded all expectations. Truly bespoke.",
    "I have been a loyal customer for six years and the quality never wavers. The wool fabric is luxurious, the fit is flawless, and the staff are always knowledgeable and professional.",
    "Perfect bespoke suit for my corporate role. The cut is sharp, the fabric holds beautifully throughout the day. Colleagues noticed immediately. Will be returning for a second suit.",
    "Incredible tailoring expertise. The team guided me through fabric selection and every measurement was precise. My suit for the wedding ceremony was absolutely perfect.",
    "World-class tailoring at Far East Plaza. The hand-stitched lapels and surgeon's buttonholes set this apart from anything I have bought ready-to-wear. A genuine luxury experience.",
    "Suresh is a master of his craft. The charcoal wool suit he made for my job interview was immaculate. I got the job. Coincidence? I think not. Thank you Picadilly Tailors.",
    "Remarkable attention to detail throughout the process. The bespoke suit arrived on time and fit perfectly after just one alteration. The linen for my summer wedding was ideal.",
    "My navy business suit from Picadilly Tailors is the finest piece of clothing I own. The fabric quality, the cut, the finish — all exceptional. Suresh really listens to what you want.",
    "Five-star service and product. The staff are incredibly knowledgeable about fabrics and styles. My evening tuxedo was completed to the highest standard. I will return without hesitation.",
    "A truly premium tailoring experience. The consultation was thorough, the fabric selection extensive, and the final result stunning. My corporate suit receives constant compliments.",
    "Picadilly Tailors has earned a lifelong customer. The bespoke fit is transformative — I had no idea how much a perfectly tailored suit could change how I look and feel. Excellent.",
    "The craftsmanship here is extraordinary. Every stitch is considered, every detail refined. My wedding suit was delivered on time and was absolutely perfect. Thank you Suresh and team.",
    "Cannot recommend highly enough. The team invested real time in understanding my body shape and preferences. The tailored result is magnificent. Best money I have ever spent on clothing.",
    "Suresh's knowledge of fabrics is encyclopaedic. He helped me choose the perfect weight wool for Singapore's climate. The suit is comfortable, sharp, and beautifully constructed.",
    "I brought my groomsmen here for their wedding suits and the whole experience was seamless. Every suit fitted perfectly, the staff were professional, and the quality was outstanding.",
    "The finest bespoke tailoring in Singapore. My black tie tuxedo is a work of art. The shawl lapel, the silk lining, the perfect drape — nothing comes close at this price point.",
    "Excellent from consultation to collection. Suresh has a remarkable eye for proportion and fit. My slim-fit business suit is exactly what I envisioned. Truly bespoke tailoring.",
    "The quality of the wool fabric is extraordinary. Suresh recommended an Italian cloth that has proven incredibly durable and elegant. My suit looks as good as the day I collected it.",
    "Came here for a special event suit and left with the best piece of clothing I have ever owned. The bespoke fit, the quality lining, the hand-finished details — absolutely exceptional.",
    "Picadilly Tailors transformed how I dress for work. My tailored suit gives me genuine confidence. Suresh's expertise and the team's service are second to none in Singapore.",
    "Outstanding value for a bespoke suit of this quality. The fabric is premium, the construction superb, and the fit perfect. I have recommended Picadilly Tailors to all my colleagues.",
    "My wedding suit from Picadilly Tailors was everything I dreamed of. The ivory linen was perfect for an outdoor ceremony. The team were patient, professional, and incredibly skilled.",
    "Returned for my third suit and the standard remains impeccable. The staff remember my preferences and the quality is consistent. This is what loyalty to a tailor feels like.",
    "Suresh is genuinely passionate about his craft. The bespoke experience — from measuring to final fitting — was a pleasure. My suit for the gala dinner was magnificent.",
    "The attention to detail at Picadilly Tailors is remarkable. The hand-stitched buttonholes, the perfect canvas construction, the quality lining — everything speaks of genuine craft.",
    "Exceptional bespoke tailoring that has made me rethink everything I knew about suits. The fit is transformative, the fabric divine. An experience I will treasure and repeat.",
]

FOUR_STAR = [
    "Very happy with my bespoke suit overall. The fabric quality and fit are excellent. One minor adjustment was needed after collection but Suresh sorted it quickly and professionally.",
    "Great tailoring experience. The staff are knowledgeable and helpful. My suit fits well and looks smart. Delivery was a week later than initially quoted but the quality made it worthwhile.",
    "Very good quality bespoke suit. The consultation was thorough and Suresh has real expertise. I would have given five stars but the turnaround took slightly longer than expected.",
    "Excellent craftsmanship and fabric quality. The suit fits beautifully. Communication during the process could be a little more proactive but the end result is fantastic.",
    "Really happy with my corporate suit. The fit is excellent and the quality is apparent. I had to visit for one adjustment but the team were accommodating and professional about it.",
    "Good bespoke tailoring experience. Suresh is clearly skilled and the suit is well constructed. The fabric selection is impressive. Just wish the process was slightly faster.",
    "Very pleased with my wedding suit. The quality and craftsmanship are evident. The team worked hard to accommodate my timeline. A small adjustment at collection was handled smoothly.",
    "Great service from a knowledgeable team. My business suit fits well and looks sharp. The process was longer than expected but the quality justifies the time. Will return.",
    "Solid bespoke tailoring. The suit construction is excellent and the fabric is quality wool. Suresh's expertise is clear. The experience was slightly less personal than I expected.",
    "Good overall experience. My suit fits well and the quality is genuine. One seam needed attention after delivery but it was fixed promptly. Definitely recommend for bespoke tailoring.",
    "Happy with the results. The suit looks smart and fits much better than off-the-rack. Suresh knows his craft. Communication during the wait period could be improved.",
    "Very good tailored suit. The fabric and construction are clearly high quality. The fitting process was thorough. Slight delay in delivery but the finished product was worth the wait.",
    "Excellent quality suit overall. Suresh was helpful and knowledgeable throughout. The bespoke fit is noticeably better than anything I have worn before. Will be back for another.",
    "Great tailoring work. The suit fits well and draws compliments. My only minor note is that the initial consultation could cover more style options. Final result is really good.",
    "Very good experience. The fabric quality is excellent and the fit is precise. Suresh took great care with the measurements. Delivery was slightly delayed but worth it for the quality.",
    "Happy with the suit overall. Looks great and fits well. The team are professional and clearly skilled. A slightly faster turnaround would make this a perfect experience.",
    "Good bespoke service. My suit is well made and I have received several compliments. The final fitting took one small adjustment. Suresh handled it with skill and good humour.",
    "Really pleased with the quality and fit. The consultation was thorough and Suresh offered helpful advice. Communication could be a bit more regular during the waiting period.",
    "A very good tailoring experience. The quality of the final suit is excellent. I needed one minor alteration which was done quickly. The team are skilled and professional throughout.",
]

THREE_STAR = [
    "The suit quality is decent and Suresh is clearly skilled. However the turnaround time was significantly longer than promised which caused stress ahead of my event. Needs improvement.",
    "Mixed experience overall. The fabric and construction are fine but the fit required more adjustments than expected for a bespoke suit. Staff were helpful in sorting it eventually.",
    "Reasonable quality tailoring but I found the pricing high for what was delivered. The suit is good but I expected more precision in the fit given the bespoke price point.",
    "The finished suit looks reasonable but the process was frustrating. Delays in communication and a longer wait than quoted made this less enjoyable than expected. Average overall.",
    "Some good and some not so good. The fabric quality is decent and Suresh is knowledgeable. But the suit needed three fittings to get right which is unusual for bespoke tailoring.",
    "Okay experience. The suit is wearable and looks alright. The turnaround time was very long and the communication was poor. For the price I expected a more premium experience.",
    "The suit is reasonably well made but I had to follow up multiple times to find out when it would be ready. The quality is acceptable but the service experience was frustrating.",
    "Average for the price. The bespoke fit is an improvement on ready-to-wear but not as precise as I hoped. Staff are friendly enough but the process felt disorganised at times.",
    "Decent quality but disappointing given the price and reputation. My suit took much longer than promised and needed two rounds of alterations. Service needs to be more consistent.",
]

TWO_STAR = [
    "Disappointed with the experience. The turnaround time was two weeks longer than promised and the suit still required significant alterations at collection. Expected much better.",
    "The quality is okay but not worth the price or the wait. Communication was poor throughout and I had to chase for updates multiple times. The fit was also not as precise as expected.",
    "Frustrating experience. The suit was delayed repeatedly and when it finally arrived the fit was off on the shoulders. Suresh corrected it but the whole process took far too long.",
]

ONE_STAR = [
    "Very poor experience. The suit took six weeks longer than promised and the quality did not justify the premium price. Communication was minimal and I had to chase constantly for updates.",
    "Disappointed. My bespoke suit was delivered with visible stitching issues and required substantial rework. The delay and quality problems made this a very poor investment.",
]

SERVICE_TYPES = ["Wedding Suit", "Business Suit", "Formal Evening", "Casual Blazer", "Alterations"]
SERVICE_WEIGHTS = [38, 31, 16, 10, 5]

# ─── Build rows ───────────────────────────────────────────────────────────────

rows = []
start_date = datetime(2025, 1, 1)

def rand_date(month: int) -> str:
    d = datetime(2025, month, random.randint(1, 28))
    return d.strftime("%Y-%m-%d")

# Rating distribution: 5★=61, 4★=19, 3★=9, 2★=3, 1★=2 → total 94
schedule = (
    [(5, r) for r in random.choices(FIVE_STAR, k=61)] +
    [(4, r) for r in random.choices(FOUR_STAR, k=19)] +
    [(3, r) for r in random.choices(THREE_STAR, k=9)] +
    [(2, r) for r in random.choices(TWO_STAR, k=3)] +
    [(1, r) for r in random.choices(ONE_STAR, k=2)]
)
random.shuffle(schedule)

# Monthly distribution: Jan-Dec 2025
monthly_counts = [5, 6, 7, 10, 11, 12, 8, 9, 10, 7, 8, 11]  # sums to 104, trim to 94
months_assigned = []
for m, c in enumerate(monthly_counts, 1):
    months_assigned.extend([m] * c)
months_assigned = months_assigned[:94]
random.shuffle(months_assigned)

return_counts = int(94 * 0.64)  # 60 return, 34 new
return_flags = [True] * return_counts + [False] * (94 - return_counts)
random.shuffle(return_flags)

for i, ((rating, text), month, is_return) in enumerate(zip(schedule, months_assigned, return_flags)):
    service = random.choices(SERVICE_TYPES, weights=SERVICE_WEIGHTS)[0]
    rows.append({
        "review_text":     text,
        "date":            rand_date(month),
        "rating":          rating,
        "service_type":    service,
        "return_customer": is_return,
    })

# Sort by date
rows.sort(key=lambda r: r["date"])

# Write CSV
with open(OUTPUT, "w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=["review_text", "date", "rating", "service_type", "return_customer"])
    writer.writeheader()
    writer.writerows(rows)

print(f"Generated {len(rows)} reviews -> {OUTPUT}")
