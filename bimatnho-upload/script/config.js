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
  chatName: "trng_c3ntr4le",   // tên hiện trên khung chat
  chatStatus: "iuu be",        // dòng nhỏ dưới tên
  // ảnh đại diện được nhúng thẳng vào đây (dạng base64), muốn đổi thì thay bằng đường dẫn ảnh, vd "img/avatar.jpg"
  chatAvatar: "data:image/jpeg;base64,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",
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
