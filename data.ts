
import { v4 as uuidv4 } from 'uuid';
import type { SavedExam, KnowledgeSource } from './types';

export const mockCurriculumDatabase: { [key: string]: { name: string; yccd: string }[] } = {
    'toán_lớp_4': [
        { name: 'Số tự nhiên, Dãy số tự nhiên', yccd: 'Đọc, viết, so sánh các số có nhiều chữ số. Nhận biết giá trị của chữ số theo vị trí.' },
        { name: 'Các phép tính với số tự nhiên', yccd: 'Thực hiện thành thạo các phép tính cộng, trừ, nhân, chia. Tính giá trị biểu thức.' },
        { name: 'Dấu hiệu chia hết', yccd: 'Nhận biết dấu hiệu chia hết cho 2, 5, 3, 9.' },
        { name: 'Phân số', yccd: 'Nhận biết phân số, so sánh phân số, thực hiện các phép tính cơ bản với phân số.' },
        { name: 'Hình học và Đo lường', yccd: 'Nhận biết góc vuông, góc nhọn, góc tù. Tính chu vi, diện tích hình chữ nhật, hình vuông.' },
    ],
    'tiếng_việt_lớp_5': [
        { name: 'Luyện từ và câu', yccd: 'Mở rộng vốn từ theo chủ điểm. Nhận biết và sử dụng các loại từ (danh từ, động từ, tính từ), câu ghép.' },
        { name: 'Tập làm văn', yccd: 'Viết được đoạn văn, bài văn tả cảnh, tả người. Kể chuyện theo tranh hoặc theo chủ đề cho trước.' },
        { name: 'Chính tả', yccd: 'Viết đúng chính tả các từ khó, phân biệt các âm/vần dễ lẫn.' },
    ],
};

export const systemExams: SavedExam[] = [
    {
        id: 'sys-exam-1',
        name: 'Toán - Lớp 4 - Kiểm tra cuối học kì I (Mẫu)',
        createdAt: new Date('2023-12-15T09:00:00Z').toISOString(),
        examInfo: {
            schoolName: 'Trường Tiểu học Mẫu',
            className: 'Lớp 4',
            subject: 'Toán',
            examTime: '40 phút',
            examTitle: 'Kiểm tra cuối học kì I (Mẫu)',
        },
        aiParams: {
            topic: 'Ôn tập số tự nhiên, phân số, hình học cơ bản',
            level1: { mc: { count: 4, points: 0.5 }, fill: { count: 0, points: 0 }, match: { count: 0, points: 0 }, tf: { count: 2, points: 0.5 }, tuLuan: { count: 1, points: 1 } },
            level2: { mc: { count: 2, points: 0.5 }, fill: { count: 0, points: 0 }, match: { count: 0, points: 0 }, tf: { count: 0, points: 0 }, tuLuan: { count: 1, points: 2 } },
            level3: { mc: { count: 0, points: 0 }, fill: { count: 0, points: 0 }, match: { count: 0, points: 0 }, tf: { count: 0, points: 0 }, tuLuan: { count: 1, points: 3 } },
        },
        questions: [
            { id: uuidv4(), level: '1', type: 'multiple_choice', text: '[Trắc nghiệm] Số "Năm mươi triệu không trăm linh năm nghìn" được viết là:\nA. 50.005.000\nB. 50.050.000\nC. 5.005.000\nD. 500.005.000\n*Đáp án: A*', points: 0.5, imageUrl: null, baseCharacterImage: null, isGeneratingImage: false, contentArea: 'so_hoc', matchingData: [] },
            { id: uuidv4(), level: '2', type: 'essay', text: '[Tự luận] Một mảnh vườn hình chữ nhật có chu vi là 120m, chiều dài hơn chiều rộng 10m. Tính diện tích của mảnh vườn đó.\n*Hướng dẫn chấm: Tính nửa chu vi, tìm chiều dài và chiều rộng theo bài toán tổng-hiệu, tính diện tích.*', points: 2, imageUrl: null, baseCharacterImage: null, isGeneratingImage: false, contentArea: 'hinh_hoc', matchingData: [] },
        ],
        matrixStructure: [
            { id: 'so_hoc', name: 'Số học', yccd: 'Đọc, viết, so sánh số tự nhiên. Thực hiện các phép tính.' },
            { id: 'hinh_hoc', name: 'Hình học và đo lường', yccd: 'Tính chu vi, diện tích hình chữ nhật.' },
        ],
        category: 'regular',
        period: 'end_term_1'
    },
];

export const systemKnowledgeSources: KnowledgeSource[] = [
    {
        id: 'sys-ks-1',
        name: 'Bài giảng mẫu - Lịch sử Việt Nam giai đoạn 1858-1945',
        type: 'text/plain',
        size: 15200,
        createdAt: new Date().toISOString(),
        content: 'Năm 1858, thực dân Pháp nổ súng xâm lược Việt Nam tại Đà Nẵng, mở đầu cho hơn 80 năm đô hộ của Pháp. Triều đình nhà Nguyễn đã từng bước nhân nhượng, cắt đất cho Pháp qua các hiệp ước Nhâm Tuất (1862), Giáp Tuất (1874), và cuối cùng là hiệp ước Patenôtre (1884), thừa nhận nền bảo hộ của Pháp trên toàn cõi Việt Nam...'
    },
    {
        id: 'sys-ks-2',
        name: 'Chuyên đề Khoa học - Vòng tuần hoàn của nước',
        type: 'text/plain',
        size: 8500,
        createdAt: new Date().toISOString(),
        content: 'Nước trên Trái Đất luôn vận động và chuyển từ trạng thái này sang trạng thái khác, từ nơi này đến nơi khác, tạo thành một vòng tuần hoàn khép kín. Dưới tác động của nhiệt độ mặt trời, nước từ các sông, hồ, biển bốc hơi tạo thành hơi nước. Hơi nước bay lên cao, gặp lạnh ngưng tụ thành những hạt nước nhỏ li ti, tạo thành mây...'
    },
    {
        id: 'sys-ks-thongtu27',
        name: 'Tóm tắt Thông tư 27/2020/TT-BGDĐT',
        type: 'text/plain',
        size: 2500,
        createdAt: new Date().toISOString(),
        content: `
TÓM TẮT CÁC QUY ĐỊNH CỐT LÕI CỦA THÔNG TƯ 27 VỀ RA ĐỀ KIỂM TRA ĐỊNH KỲ

Thông tư 27/2020/TT-BGDĐT của Bộ Giáo dục và Đào tạo quy định về việc đánh giá học sinh tiểu học, trong đó có các yêu cầu quan trọng về việc xây dựng đề kiểm tra định kỳ.

1. MỤC ĐÍCH:
- Đánh giá mức độ học sinh đáp ứng yêu cầu cần đạt của chương trình học.
- Giúp giáo viên điều chỉnh phương pháp dạy và hỗ trợ học sinh tiến bộ.

2. YÊU CẦU:
- Đánh giá vì sự tiến bộ của học sinh, không so sánh các học sinh với nhau.
- Không tạo áp lực cho học sinh, giáo viên và phụ huynh.
- Kết hợp giữa đánh giá định kỳ bằng điểm số và đánh giá thường xuyên bằng nhận xét.

3. CẤU TRÚC ĐỀ KIỂM TRA (QUAN TRỌNG NHẤT):
Đề kiểm tra phải bao gồm các câu hỏi và bài tập được thiết kế theo 3 mức độ nhận thức sau:

- Mức 1 (Nhận biết):
  + Yêu cầu học sinh nhận biết, nhắc lại hoặc mô tả được nội dung đã học.
  + Áp dụng trực tiếp kiến thức để giải quyết các tình huống, vấn đề quen thuộc.
  + Ví dụ: Nhắc lại một định nghĩa, thực hiện một phép tính cơ bản, xác định một sự kiện lịch sử.

- Mức 2 (Thông hiểu / Kết nối):
  + Yêu cầu học sinh kết nối, sắp xếp các kiến thức đã học để giải quyết một vấn đề có nội dung tương tự như đã học.
  + Yêu cầu khả năng giải thích, so sánh, phân loại.
  + Ví dụ: So sánh hai nhân vật, giải một bài toán có lời văn tương tự mẫu, giải thích một hiện tượng khoa học đơn giản.

- Mức 3 (Vận dụng):
  + Yêu cầu học sinh vận dụng các kiến thức, kỹ năng đã học để giải quyết một vấn đề mới, chưa từng được làm quen hoặc đưa ra những phản hồi hợp lý trong học tập và cuộc sống.
  + Yêu cầu khả năng phân tích, đánh giá, sáng tạo.
  + Ví dụ: Giải một bài toán có yếu tố mới lạ, viết một đoạn văn thể hiện quan điểm cá nhân, đề xuất giải pháp cho một tình huống thực tế.

Khi tạo đề, AI phải tuân thủ nghiêm ngặt việc phân bổ câu hỏi theo 3 mức độ này để đảm bảo đề thi phù hợp với quy định của Bộ Giáo dục và Đào tạo Việt Nam.
`
    },
    {
        id: 'sys-ks-thongtu32',
        name: 'Chương trình GDPT tổng thể (Thông tư 32/2018/TT-BGDĐT)',
        type: 'text/plain',
        size: 67348,
        createdAt: new Date().toISOString(),
        content: `CHƯƠNG TRÌNH GIÁO DỤC PHỔ THÔNG - CHƯƠNG TRÌNH TỔNG THỂ
(Ban hành kèm theo Thông tư số 32/2018/TT-BGDĐT ngày 26 tháng 12 năm 2018 của Bộ trưởng Bộ Giáo dục và Đào tạo)

LỜI NÓI ĐẦU
Chương trình giáo dục phổ thông mới được xây dựng theo định hướng phát triển phẩm chất và năng lực của học sinh; tạo môi trường học tập và rèn luyện giúp học sinh phát triển hài hoà về thể chất và tinh thần, trở thành người học tích cực, tự tin, biết vận dụng các phương pháp học tập tích cực để hoàn chỉnh các tri thức và kĩ năng nền tảng, có ý thức lựa chọn nghề nghiệp và học tập suốt đời; có những phẩm chất tốt đẹp và năng lực cần thiết để trở thành người công dân có trách nhiệm, người lao động có văn hoá, cần cù, sáng tạo, đáp ứng nhu cầu phát triển của cá nhân và yêu cầu của sự nghiệp xây dựng, bảo vệ đất nước trong thời đại toàn cầu hoá và cách mạng công nghiệp mới.

I. QUAN ĐIỂM XÂY DỰNG CHƯƠNG TRÌNH
1. Là văn bản thể hiện mục tiêu, quy định yêu cầu cần đạt, nội dung, phương pháp giáo dục và đánh giá, làm căn cứ quản lí chất lượng.
2. Dựa trên quan điểm của Đảng, Nhà nước; kế thừa ưu điểm của chương trình cũ, tiếp thu kinh nghiệm quốc tế; phù hợp với con người, văn hoá Việt Nam và xu thế chung.
3. Bảo đảm phát triển phẩm chất và năng lực người học thông qua kiến thức, kĩ năng cơ bản, thiết thực, hiện đại; chú trọng thực hành, vận dụng; tích hợp ở lớp dưới, phân hoá ở lớp trên.
4. Bảo đảm kết nối chặt chẽ giữa các cấp học và liên thông với giáo dục mầm non, nghề nghiệp, đại học.
5. Xây dựng theo hướng mở: thống nhất nội dung cốt lõi, trao quyền chủ động cho địa phương và nhà trường; không quy định quá chi tiết; bảo đảm tính ổn định và khả năng phát triển.

II. MỤC TIÊU CHƯƠNG TRÌNH
Giúp học sinh làm chủ kiến thức phổ thông, vận dụng hiệu quả vào đời sống, tự học suốt đời, có định hướng nghề nghiệp, phát triển hài hoà các mối quan hệ xã hội, có nhân cách và đời sống tâm hồn phong phú.
- Cấp Tiểu học: Hình thành nền móng cho sự phát triển hài hoà, giáo dục về giá trị bản thân, gia đình, cộng đồng.
- Cấp THCS: Phát triển năng lực đã có, tự điều chỉnh bản thân, hoàn chỉnh tri thức nền tảng, có ý thức hướng nghiệp.
- Cấp THPT: Tiếp tục phát triển phẩm chất, năng lực người lao động, nhân cách công dân, khả năng tự học, lựa chọn nghề nghiệp, thích ứng với thay đổi.

III. YÊU CẦU CẦN ĐẠT VỀ PHẨM CHẤT VÀ NĂNG LỰC
1. Phẩm chất chủ yếu: yêu nước, nhân ái, chăm chỉ, trung thực, trách nhiệm.
2. Năng lực cốt lõi:
   a) Năng lực chung: tự chủ và tự học, giao tiếp và hợp tác, giải quyết vấn đề và sáng tạo.
   b) Năng lực đặc thù: ngôn ngữ, tính toán, khoa học, công nghệ, tin học, thẩm mĩ, thể chất.

IV. KẾ HOẠCH GIÁO DỤC
Chia thành 2 giai đoạn: giáo dục cơ bản (lớp 1-9) và giáo dục định hướng nghề nghiệp (lớp 10-12).
- Cấp Tiểu học: Dạy 2 buổi/ngày. Các môn bắt buộc gồm Tiếng Việt, Toán, Đạo đức, Ngoại ngữ 1 (từ lớp 3), Tự nhiên và Xã hội (lớp 1-3), Lịch sử và Địa lí (lớp 4-5), Khoa học (lớp 4-5), Tin học và Công nghệ (từ lớp 3), Giáo dục thể chất, Nghệ thuật, Hoạt động trải nghiệm.
- Cấp THCS: Dạy 1 buổi/ngày (khuyến khích 2 buổi). Các môn bắt buộc gồm Ngữ văn, Toán, Ngoại ngữ 1, GDCD, Lịch sử và Địa lí, KHTN, Công nghệ, Tin học, Giáo dục thể chất, Nghệ thuật, Hoạt động trải nghiệm, hướng nghiệp, Nội dung giáo dục của địa phương.
- Cấp THPT (Giai đoạn định hướng nghề nghiệp): Các môn bắt buộc gồm Ngữ văn, Toán, Ngoại ngữ 1, Lịch sử, Giáo dục thể chất, GDQP&AN. Học sinh chọn 4 môn từ nhóm môn lựa chọn (Địa lí, GD kinh tế và pháp luật, Vật lí, Hóa học, Sinh học, Công nghệ, Tin học, Âm nhạc, Mĩ thuật) và 3 cụm chuyên đề học tập.

V. ĐỊNH HƯỚNG VỀ NỘI DUNG GIÁO DỤC
Thực hiện giáo dục toàn diện qua các lĩnh vực: ngôn ngữ và văn học, toán học, khoa học xã hội, khoa học tự nhiên, công nghệ, tin học, công dân, quốc phòng và an ninh, nghệ thuật, thể chất, hướng nghiệp.
- Giai đoạn giáo dục cơ bản (Tiểu học, THCS): Giáo dục toàn diện và tích hợp.
- Giai đoạn giáo dục định hướng nghề nghiệp (THPT): Giáo dục phân hoá, tiếp cận nghề nghiệp.

VI. ĐỊNH HƯỚNG VỀ PHƯƠNG PHÁP VÀ ĐÁNH GIÁ
- Phương pháp giáo dục: Tích cực hoá hoạt động của học sinh, giáo viên là người tổ chức, hướng dẫn. Tổ chức đa dạng hình thức học tập trong và ngoài nhà trường.
- Đánh giá kết quả giáo dục: Cung cấp thông tin về mức độ đáp ứng yêu cầu cần đạt. Căn cứ đánh giá là yêu cầu về phẩm chất, năng lực. Kết hợp đánh giá thường xuyên (nhận xét) và định kì (điểm số).

(Văn bản này tóm tắt các điểm chính. Nội dung chi tiết về từng phẩm chất, năng lực, và môn học được quy định cụ thể trong các phần còn lại của Thông tư.)
`
    }
];

export const textbookTopics = [
    {
        subject: 'Toán lớp 4',
        topics: [
            { name: 'Số tự nhiên, Biểu thức', topic: 'Ôn tập về số tự nhiên, các phép tính và giá trị của biểu thức' },
            { name: 'Phân số', topic: 'Các bài toán về so sánh, rút gọn và các phép tính với phân số' },
            { name: 'Hình học', topic: 'Bài toán về chu vi, diện tích hình chữ nhật, hình vuông, hình bình hành' },
        ]
    },
    {
        subject: 'Tiếng Việt lớp 5',
        topics: [
            { name: 'Tả cảnh', topic: 'Luyện tập viết các đoạn văn, bài văn tả cảnh sông nước, núi rừng' },
            { name: 'Từ đồng nghĩa, trái nghĩa', topic: 'Các bài tập về tìm và sử dụng từ đồng nghĩa, trái nghĩa' },
            { name: 'Câu ghép', topic: 'Luyện tập xác định và nối các vế câu trong câu ghép' },
        ]
    }
];

export const mockDriveFiles = [
    { id: '1', name: 'Giao an Toan Lop 5 - Hoc Ky 1.docx' },
    { id: '2', name: 'Bai giang Lich su chong Phap.pdf' },
    { id: '3', name: 'Chuyen de Boi duong HSG Toan.docx' },
];
