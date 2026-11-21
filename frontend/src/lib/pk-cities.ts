/** Major Pakistani cities for address autocomplete (free text is still allowed). */
export const PK_CITIES = [
  "Karachi", "Lahore", "Islamabad", "Rawalpindi", "Faisalabad", "Multan", "Peshawar", "Quetta", "Hyderabad", "Gujranwala",
  "Sialkot", "Bahawalpur", "Sargodha", "Sukkur", "Larkana", "Sheikhupura", "Abbottabad", "Mardan", "Gujrat", "Sahiwal",
  "Okara", "Rahim Yar Khan", "Jhang", "Dera Ghazi Khan", "Kasur", "Mirpur (AJK)", "Muzaffarabad", "Nawabshah", "Chiniot", "Kamoke",
  "Mandi Bahauddin", "Jhelum", "Sadiqabad", "Khanewal", "Hafizabad", "Kohat", "Jacobabad", "Shikarpur", "Muzaffargarh", "Khanpur",
  "Gojra", "Bahawalnagar", "Mansehra", "Swat (Mingora)", "Gilgit", "Skardu", "Wah Cantt", "Taxila", "Attock", "Chakwal",
  "Vehari", "Toba Tek Singh", "Burewala", "Daska", "Narowal", "Pakpattan", "Dera Ismail Khan", "Mianwali", "Nowshera", "Charsadda",
] as const;

/** 03XXXXXXXXX (mobile) — tolerant of spaces, dashes and +92 */
export const PK_PHONE_RE = /^(?:\+92|92|0)3\d{9}$/;
