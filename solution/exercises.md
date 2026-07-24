# K4 — Ngày 1: Bài Tập & Phản Ánh
## Khám Phá LLM API | Phiếu Thực Hành

**Thời lượng:** 14h00–18h00
**Cách làm:** Trả lời từng câu ngay sau khi hoàn thành block tương ứng —
đừng để dồn hết về cuối buổi. Thay dòng `*Câu trả lời của bạn*` bằng câu
trả lời thật (chấm tự động sẽ đếm số câu đã trả lời).

---

## Block 1 — API Cơ Bản (trả lời sau Checkpoint 1)

### Câu 1.1 — Độ nhạy của temperature
Gọi `call_openai` với temperature 0.0, 0.7, 1.2 và 1.8 dùng prompt
**"Hãy kể cho tôi một sự thật thú vị về Hà Nội."**

**Bạn nhận thấy quy luật gì qua bốn phản hồi? Ở mức nào phản hồi bắt đầu
kém mạch lạc?** (2–3 câu)
> Temperature càng cao, câu trả lời càng đa dạng và sáng tạo nhưng độ rủi ro cũng tăng. Ở mức 0.0, model trả lời rất ổn định và lặp lại; mức 0.7 tự nhiên và cân bằng; từ 1.2 bắt đầu xuất hiện những từ ngữ kỳ lạ và ở mức 1.8 câu trả lời hoàn toàn bịa đặt, vô nghĩa và kém mạch lạc.

### Câu 1.2 — Chọn temperature cho sản phẩm
**Bạn sẽ đặt temperature bao nhiêu cho trợ lý soạn thảo hợp đồng pháp lý,
và bao nhiêu cho trợ lý viết slogan quảng cáo? Giải thích khác biệt.**
> Với trợ lý pháp lý, temperature nên đặt ở mức 0.0 hoặc rất thấp (0.1-0.2) để đảm bảo độ chính xác tuyệt đối, nhất quán và tránh "ảo giác". Với trợ lý viết slogan quảng cáo, nên đặt cao hơn (khoảng 0.7-1.0) để kích thích sự sáng tạo, đa dạng từ vựng và những ý tưởng đột phá.
### Câu 1.3 — Đánh đổi chi phí
Kịch bản: 20.000 người dùng hoạt động mỗi ngày, mỗi người gọi API 2 lần,
mỗi lần trung bình ~500 token đầu ra.

**Ước tính chi phí mỗi ngày của model lớn so với model nhỏ cho workload này
(dựa trên bảng giá trong template). Nêu một trường hợp model lớn xứng đáng
với chi phí và một trường hợp model nhỏ là lựa chọn đúng:**
> Ước lượng 20,000,000 output tokens. GPT-4o (lớn) tốn khoảng $200/ngày, trong khi GPT-4o-mini (nhỏ) chỉ tốn khoảng $12/ngày. Model lớn xứng đáng với chi phí khi cần phân tích, lập luận phức tạp hoặc dịch thuật chuyên sâu. Model nhỏ là lựa chọn đúng cho tác vụ đơn giản, trích xuất dữ liệu, phân loại văn bản hay tóm tắt nội dung để tiết kiệm ngân sách.
---

## Block 2 — System Prompt & Token (trả lời sau Checkpoint 2)

### Câu 2.1 — Sức mạnh của persona
Gọi `chat_with_system_prompt` hai lần với cùng câu hỏi
**"Giải thích máy học (machine learning) là gì?"** nhưng hai system prompt
khác nhau:
- "Bạn là một nhà thơ, trả lời mọi thứ bằng hình ảnh ví von, tránh thuật ngữ."
- "Bạn là kỹ sư phần mềm senior, trả lời chính xác, có ví dụ code khi phù hợp."

**Hai phản hồi khác nhau như thế nào (giọng văn, độ dài, mức kỹ thuật)?
Từ đó rút ra system prompt điều khiển được những khía cạnh nào của phản hồi?**
(3–4 câu)
> Phản hồi của "nhà thơ" mang tính tượng hình, ví von và dùng từ bay bổng, tránh thuật ngữ. Phản hồi của "kỹ sư" mang tính định nghĩa kỹ thuật, rành mạch, có tính chuyên môn cao. Từ đó cho thấy system prompt có thể điều khiển được giọng điệu (tone), phong cách (style), mức độ chi tiết và đối tượng độc giả mục tiêu của phản hồi.

### Câu 2.2 — tiktoken vs đếm từ
Chọn một đoạn văn tiếng Việt ~150 từ. So sánh số token theo `count_tokens`
(tiktoken) với ước lượng `số từ / 0.75` mà Part 1 đã dùng.

**Hai con số chênh nhau bao nhiêu phần trăm? Nếu dùng ước lượng thô để dự
toán ngân sách API cho ứng dụng tiếng Việt, bạn sẽ dự toán thiếu hay thừa —
và vì sao?**
> Đoạn văn tiếng Việt 150 từ đếm bằng tiktoken thường tốn khoảng 250-350 tokens (do nhiều ký tự có dấu), trong khi tính thô chỉ ra 200 tokens. Hai số này chênh nhau khoảng 30-70%. Nếu dùng ước lượng thô, ta sẽ dự toán thiếu ngân sách trầm trọng, vì LLM dùng tokenizer tối ưu cho tiếng Anh, khi mã hóa tiếng Việt sẽ tạo ra số lượng token lớn hơn nhiều so với dự tính.

---

## Block 3 — Streaming & Độ Bền (trả lời sau Checkpoint 3)

### Câu 3.1 — Trải nghiệm người dùng với streaming
**Xét ba ứng dụng: (a) chatbot văn bản, (b) trợ lý giọng nói đọc to phản hồi,
(c) pipeline dịch tài liệu chạy ngầm ban đêm. Ứng dụng nào hưởng lợi nhiều
nhất từ streaming, ứng dụng nào không cần — và tại sao?** (1 đoạn văn)
> Ứng dụng (b) trợ lý giọng nói hưởng lợi nhiều nhất vì cần phản hồi ngay khi token đầu tiên xuất hiện để phát âm (độ trễ bằng 0). Chatbot (a) cũng cần để UX mượt mà. Ứng dụng (c) pipeline dịch ngầm ban đêm hoàn toàn không cần streaming vì không có ai ngồi đợi đọc từng chữ, việc nhận toàn bộ response một lần sau khi xử lý xong sẽ dễ dàng lưu trữ và quản lý hơn.

### Câu 3.2 — Vì sao backoff theo cấp số nhân?
**Khi API quá tải và hàng nghìn client cùng retry, exponential backoff giúp
gì so với delay cố định? Tra cứu thêm: kỹ thuật "jitter" (thêm độ trễ ngẫu
nhiên) giải quyết vấn đề gì còn sót lại?**
> Exponential backoff giúp giảm tải dần áp lực lên server khi API quá tải, tránh việc liên tục gửi request dồn dập khiến server không thể phục hồi. Kỹ thuật "jitter" (thêm độ trễ ngẫu nhiên) giúp giải quyết hiện tượng "thundering herd" (hiệu ứng bầy đàn): ngăn chặn việc nhiều client cùng đồng bộ retry vào cùng một thời điểm tạo ra những đợt quá tải mới.



---

## Block 4 — Mini-Project (trả lời sau Checkpoint 4)

### Câu 4.1 — Thiết kế persona
**Viết lại system prompt bạn dùng cho trợ lý của mình. Chỉ ra 2 chỗ trong
prompt mà nếu xóa đi, hành vi trợ lý sẽ thay đổi rõ rệt — và mô tả thay đổi
đó:**
> System prompt: "Bạn là trợ giảng thân thiện của khóa AI, trả lời ngắn gọn bằng tiếng Việt, luôn xưng mình và gọi người dùng là bạn". Nếu xóa "ngắn gọn", hành vi model sẽ thay đổi rõ rệt: nó có thể đưa ra giải thích dài dòng và cung cấp quá nhiều thông tin không cần thiết. Nếu xóa "bằng tiếng Việt", nó có thể sẽ trả lời bằng tiếng Anh theo mặc định nếu câu hỏi được hỏi bằng tiếng Anh.

### Câu 4.2 — Hạn chế & cải thiện
**Trợ lý của bạn giữ history 4 lượt cuối. Hãy mô tả một tình huống hội thoại
cụ thể mà giới hạn này khiến trợ lý trả lời sai/mất ngữ cảnh, và đề xuất một
cách khắc phục (ví dụ: tóm tắt các lượt cũ, tăng giới hạn có chọn lọc...):**
> Tình huống: Người dùng đưa ra một vấn đề kỹ thuật lớn ở lượt 1, sau đó 5 lượt tiếp theo họ chỉ hỏi những câu ngắn gọn xoay quanh cách fix lỗi nhỏ. Ở lượt thứ 6, trợ lý không còn nhớ bối cảnh tổng thể bài toán gốc ở lượt 1 nữa và trả lời sai lạc hướng. Khắc phục: Thay vì cắt hẳn các lượt cũ, có thể tích hợp một bước "tóm tắt hội thoại ngầm" sau mỗi 4 lượt, hoặc luôn giữ lại 1-2 tin nhắn đầu tiên của phiên làm việc.
---

## Danh Sách Kiểm Tra Nộp Bài

- [ ] `python grade.py` — xem điểm tự động, mục tiêu ≥ 75/100
- [ ] Cả 4 checkpoint pytest đều pass
- [ ] Tất cả 9 câu trong file này đã được trả lời
- [ ] Đã copy bài làm vào folder `solution/`, push lên GitHub cá nhân và nộp link repo vào vlearn (theo hướng dẫn README)
