// =====================================================================
//  FILE CẤU HÌNH — muốn sửa chữ, ảnh, nhạc, link thì chỉ cần sửa ở đây.
//
//  Có thể dùng mấy "biến" này trong bất kỳ câu nào, thiệp sẽ tự thay:
//    {name}     → cách gọi người nhận (Bae)
//    {fullName} → tên đầy đủ (Diệu Linh)
//    {sender}   → người gửi (Trung)
//    {age}      → tuổi tròn năm nay (tự tính từ ngày sinh), vd 23
//    {ageth}    → tuổi kiểu tiếng Anh, vd 23rd
//    {date}     → ngày sinh nhật năm nay, vd 19 · 11 · 2026
//  Được phép dùng thẻ HTML đơn giản như <em>, <b>, <br>.
// =====================================================================

window.CARD = {
  name: "Bae",
  fullName: "Diệu Linh",
  sender: "Trung",
  birthday: "2003-11-19", // năm-tháng-ngày

  pageTitle: "Bí mật 🎁",

  // Nhạc: chép file bài "In Love" vào thư mục music/ và đặt tên inlove.mp3.
  // Nếu chưa có file đó, thiệp tự dùng HPBD.MP3.
  // start = bắt đầu phát từ giây thứ mấy, end = tới giây này thì quay lại start.
  // Đang để: bỏ 11 giây đầu, beat vào ngay lúc hiện chữ "It's your birthday!!",
  // và cắt đoạn im lặng cuối bài (bài dài 3:21).
  music: { src: "music/inlove.mp3", fallback: "music/HPBD.MP3", start: 11, end: 196, volume: 0.85 },

  instagramDM: "https://www.instagram.com/direct/t/111685446894110/",

  // ---------- Màn mở quà (tiếng Việt) ----------
  loading: "Đang gói quà cho {name}…",
  gift: {
    title: "{sender} có một món quà nhỏ cho {name} nè",
    hint: "Chạm vào hộp quà để mở nha",
    note: "Nhớ bật âm thanh lên nhé 🎧"
  },

  // ---------- Lời chào ----------
  intro: {
    hi: "À nhonn 🌷",
    sub: "psst… today is kind of a big day 🤫",
    date: "{date}",
    birthday: "It's your birthday!!",
    age: "Happy {ageth} ✨"
  },

  // ---------- Tin nhắn ----------
  chat: [
    "Happy birthday, {name} 🎂",
    "I wanted to give you something a little more special than just a text…",
    "so I made this. just for you 🥺"
  ],
  chatSeen: "Delivered",

  // ---------- Mấy câu nói nhỏ ----------
  lines: [
    "Honestly, I'm not very good at saying things like this out loud…",
    "but you make ordinary days feel a little softer 🌸",
    "and your smile is kind of unfair, you know?",
    "So today, I just want you to know…"
  ],
  special: { pre: "you are", word: "special" },

  // ---------- Xấp ảnh polaroid (ảnh cuối cùng nằm trên cùng) ----------
  photosTitle: "a few of my favorite pictures of you 📸",
  photos: [
    { src: "img/photos/walk.jpg",   caption: "wherever you're headed, I hope it's somewhere happy" },
    { src: "img/photos/mirror.jpg", caption: "my favorite “người lạ trong mơ” 📷" },
    { src: "img/photos/lace.jpg",   caption: "softest girl in the frame 🤍" },
    { src: "img/photos/mood.jpg",   caption: "main character energy ✨" },
    { src: "img/photos/cafe.jpg",   caption: "this face? 10/10, no notes 🫠" },
    { src: "img/photos/lotus.jpg",  caption: "all these flowers, and you're still the prettiest one 🌸" }
  ],

  // ---------- Bánh kem & thổi nến ----------
  cake: {
    title: "Make a wish 🤍",
    hint: "Close your eyes, make a wish… then blow out the candles!",
    micButton: "🎤 Blow into the mic",
    tapHint: "or just tap the flames",
    listening: "I'm listening… blow hard! 🌬️",
    micFail: "Can't use the mic — just tap the flames instead 🕯️",
    done: "Happy Birthday!",
    after: "may every wish you just made come true 🌷"
  },

  // ---------- Lá thư ----------
  wishPhoto: "img/photos/lotus.jpg",
  wish: [
    "Happy {ageth} birthday, {name} 🎂",
    "I hope this year treats you gently — more sunny mornings, more good food, and more reasons to laugh until your cheeks hurt.",
    "Keep being exactly who you are: a little dreamy, and a lot lovely.",
    "And whenever you need someone to celebrate with… I'm right here. 🤍"
  ],

  // ---------- Câu hỏi cuối (tiếng Việt) ----------
  invite: {
    pre: "Ờm… còn một chuyện nữa nè 👉👈",
    question: "Cuối tuần này bé đi ăn mừng sinh nhật với {sender} nha? 🥺",
    yes: "Đi chứ! 💖",
    no: "Hông 😤",
    // mỗi lần định bấm "Hông", nút sẽ chạy trốn và đổi chữ:
    noTexts: ["Chắc chưa?", "Suy nghĩ lại đi mà 🥺", "Bấm nhầm rồi đó", "Nút này hư rồi 😝", "Thôi mà {name} ơi", "Không có lựa chọn này đâu 🙈"],
    giveUp: "Ừ thì đi 🙈",
    yayTitle: "Yayyy!! Hẹn bé nha 🥰",
    yaySub: "Nhắn {sender} chọn ngày với quán {name} thích nha, {sender} bao hết 😎",
    dmButton: "💌 Nhắn cho {sender}",
    replayButton: "🔄 Xem lại từ đầu"
  }
};
