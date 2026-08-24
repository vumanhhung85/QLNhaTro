// sw.js — Service Worker cho Sổ Thu Tiền Nhà Trọ 187 NSHL
//
// MỤC ĐÍCH DUY NHẤT: cache "vỏ" giao diện tĩnh (index.html, icon, manifest,
// offline.html) để mở app nhanh hơn + có màn hình đẹp khi mất mạng, THAY VÌ
// trang lỗi mặc định xấu của Chrome.
//
// KHÔNG cache dữ liệu: mọi request khác gốc (Google Apps Script, CDN thư viện,
// Google Fonts...) đều bị bỏ qua ở dòng "url.origin !== self.location.origin"
// bên dưới — luôn đi thẳng ra mạng như không có service worker, không có rủi ro
// hiện số liệu cũ/sai.
//
// ⚠️ LƯU Ý CHO ANH HƯNG: mỗi khi sửa index.html những chỗ QUAN TRỌNG (không phải
// sửa nhỏ), nhớ đổi số ở CACHE_VERSION bên dưới (vd v1 -> v2) rồi mới upload lên
// GitHub Pages. Nếu không đổi số, một số máy đã cài sẵn có thể vẫn thấy bản cache
// cũ một thời gian trước khi cập nhật.

const CACHE_VERSION = 'nt187-shell-v1';

const SHELL_FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './offline.html',
  './logo_187_xanhla.png',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

// Cài đặt: tải trước các file vỏ tĩnh vào cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => cache.addAll(SHELL_FILES))
      .then(() => self.skipWaiting())
  );
});

// Kích hoạt: dọn cache của phiên bản cũ, nhận quyền điều khiển ngay
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Không đụng vào POST — mọi thao tác ghi dữ liệu (lưu tiền phòng, tạm trú...)
  // đều là POST gọi thẳng tới Google Apps Script.
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // Khác gốc (script.google.com, cdnjs, fonts.googleapis.com...) → bỏ qua hoàn
  // toàn, để trình duyệt tự xử lý như không có service worker. Đây là chỗ đảm
  // bảo KHÔNG BAO GIỜ cache nhầm dữ liệu thật hoặc thư viện ngoài.
  if (url.origin !== self.location.origin) return;

  // Mở trang / F5 (điều hướng): ưu tiên mạng thật để luôn thấy bản mới nhất.
  // Chỉ khi mất mạng hẳn mới rơi về màn hình "Mất kết nối".
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('./offline.html'))
    );
    return;
  }

  // Các file tĩnh cùng gốc khác (icon, manifest...): trả cache trước cho nhanh,
  // đồng thời âm thầm tải bản mới về cập nhật cache cho lần sau.
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(req, clone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
