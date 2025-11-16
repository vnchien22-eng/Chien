import type { DigitalCompetencyPillar, GradeCurriculum } from './types';

export const digitalCompetencyPillars: DigitalCompetencyPillar[] = [
    {
        id: 'nls_foundation',
        title: 'Nền tảng số',
        description: 'Củng cố thao tác với thiết bị, sử dụng tài khoản, lưu trữ đám mây theo hướng dẫn của CV 3456 và chương trình GDPT 2018.',
        reference: 'CV 3456/HD-BGDĐT',
        classroomActions: [
            'Thực hành đăng nhập tài khoản trường học và đồng bộ tệp lên Google Drive',
            'Sử dụng các biểu tượng hệ điều hành để điều hướng và tìm kiếm',
            'Ghi nhớ quy tắc bảo mật mật khẩu theo tài liệu phát triển NLS tiểu học'
        ]
    },
    {
        id: 'nls_safety',
        title: 'An toàn & trách nhiệm số',
        description: 'Bảo vệ thông tin cá nhân, sử dụng nguồn tin đáng tin cậy, tuân thủ thông tư 02/2025/TT-BGDĐT.',
        reference: 'Thông tư 02/2025/TT-BGDĐT',
        classroomActions: [
            'Phân tích tình huống về quyền riêng tư khi học trực tuyến',
            'Thiết lập bộ quy tắc lớp học số dựa trên CV 3456',
            'Thực hiện đánh giá nhanh độ tin cậy của nguồn học liệu số'
        ]
    },
    {
        id: 'nls_creativity',
        title: 'Sáng tạo nội dung số',
        description: 'Ứng dụng phần mềm đơn giản để thiết kế ấn phẩm, video, lập trình kéo thả theo chương trình Tin học 2018.',
        reference: 'CT GDPT 2018 - Tin học',
        classroomActions: [
            'Sử dụng Scratch/Microsoft MakeCode để tạo hoạt cảnh',
            'Thiết kế poster với Canva hoặc PowerPoint',
            'Xuất bản sản phẩm số và chia sẻ có trách nhiệm'
        ]
    },
    {
        id: 'nls_data',
        title: 'Tư duy dữ liệu',
        description: 'Thu thập, ghi chép và trình bày dữ liệu học tập bằng bảng tính, biểu đồ đơn giản.',
        reference: 'Tài liệu phát triển NLS (Final)',
        classroomActions: [
            'Lập bảng tiến độ đọc sách của lớp trong Google Sheets',
            'So sánh dữ liệu bằng biểu đồ cột',
            'Đưa ra nhận xét dựa trên số liệu thu được'
        ]
    },
    {
        id: 'nls_collaboration',
        title: 'Hợp tác số',
        description: 'Tổ chức, phân công nhiệm vụ trong không gian trực tuyến, giao tiếp qua công cụ học tập số.',
        reference: 'CV 3456 & Thông tư 02/2025',
        classroomActions: [
            'Làm việc nhóm trong Google Workspace/Microsoft 365',
            'Sử dụng bảng Jamboard/Miro để đồng kiến tạo ý tưởng',
            'Thực hành phản hồi tích cực trên nền tảng lớp học'
        ]
    }
];

export const gradeCurriculums: GradeCurriculum[] = [
    {
        grade: 'Lớp 3',
        summary: 'Tập trung hình thành thói quen học an toàn trên môi trường số, bước đầu ứng dụng công cụ số để hỗ trợ các môn học khác.',
        keyFocus: 'Khởi động năng lực số nền tảng và an toàn thông tin',
        weeklyStructure: {
            total: '70 tiết/năm (~2 tiết/tuần)',
            digitalTime: '50% thời lượng dành cho thực hành với thiết bị/ứng dụng',
            highlights: [
                'Tuần 1-3: Thiết lập kỷ luật lớp học số và giới thiệu tài khoản học tập',
                'Tuần 10-18: Tích hợp Tin học với Toán/TNXH qua dự án dữ liệu đơn giản',
                'Tuần 25-35: Sản xuất poster, thiệp điện tử phục vụ hoạt động trải nghiệm'
            ]
        },
        competencyTargets: [
            {
                name: 'Nhận biết thiết bị và phần mềm giáo dục',
                description: 'Học sinh sử dụng được bàn phím, chuột, ứng dụng soạn thảo cơ bản theo CT GDPT 2018.',
                linkedDocuments: ['CT GDPT 2018 môn Tin học', 'CV 3456 mục 1.1']
            },
            {
                name: 'An toàn và ứng xử số',
                description: 'Học sinh nhận biết được thông tin cá nhân, biết xin phép khi đăng tải sản phẩm theo Thông tư 02/2025.',
                linkedDocuments: ['Thông tư 02/2025/TT-BGDĐT', 'CV 3456 mục 2.2']
            },
            {
                name: 'Ứng dụng số hỗ trợ học tập liên môn',
                description: 'Biết ghi chép, trình bày dữ liệu bằng bảng biểu đơn giản từ tài liệu phát triển NLS (Final).',
                linkedDocuments: ['Tài liệu phát triển NLS (Final)', 'CT GDPT 2018 - Tự nhiên & Xã hội']
            }
        ],
        modules: [
            {
                id: 'l3-1',
                theme: 'An toàn và trách nhiệm số',
                duration: 'Tuần 1-5',
                objectives: [
                    'Nhận biết thông tin cá nhân, mật khẩu mạnh',
                    'Thiết lập nội quy lớp học số theo CV 3456',
                    'Thực hành báo cáo tình huống nguy cơ khi học trực tuyến'
                ],
                digitalFocus: 'Kỹ năng an toàn thông tin - TT 02/2025',
                assessment: 'Nhật kí phản hồi tình huống + poster quy tắc lớp học số',
                resources: ['CV 3456/HD-BGDĐT', 'Thông tư 02/2025/TT-BGDĐT', 'Tài liệu phát triển NLS trang 12-18']
            },
            {
                id: 'l3-2',
                theme: 'Công cụ số hỗ trợ Toán & TNXH',
                duration: 'Tuần 6-18',
                objectives: [
                    'Sử dụng bảng tính ghi chép số liệu đo đạc',
                    'Tạo biểu đồ cột thể hiện kết quả thí nghiệm đơn giản',
                    'Chia sẻ bảng dữ liệu cho bạn cùng lớp'
                ],
                digitalFocus: 'Tư duy dữ liệu và hợp tác số',
                assessment: 'Bài báo cáo ngắn với bảng biểu + nhận xét theo rubrics',
                resources: ['Tài liệu phát triển NLS (Final) - mục 3', 'CT GDPT 2018 môn Tin học', 'Giáo trình TNXH lớp 3']
            },
            {
                id: 'l3-3',
                theme: 'Sáng tạo sản phẩm số phục vụ trải nghiệm',
                duration: 'Tuần 19-35',
                objectives: [
                    'Thiết kế thiệp/áp phích bằng PowerPoint/Canva',
                    'Lồng ghép nội dung Đạo đức, TNXH vào sản phẩm số',
                    'Giới thiệu sản phẩm trước lớp và phản hồi chéo'
                ],
                digitalFocus: 'Sáng tạo nội dung số',
                assessment: 'Trưng bày sản phẩm + phiếu tự đánh giá theo TT 02/2025',
                resources: ['Tài liệu phát triển NLS (Final) - mục 4', 'CT GDPT 2018 hoạt động trải nghiệm', 'Kho học liệu số địa phương']
            }
        ],
        digitalProjects: [
            {
                title: 'Sổ tay an toàn số của lớp',
                description: 'Nhóm học sinh biên soạn quy tắc, biểu tượng cảnh báo và chia sẻ trên Padlet.',
                output: 'Padlet/Slides tổng hợp',
                weeks: 'Tuần 4-5'
            },
            {
                title: 'Trạm dữ liệu cây xanh',
                description: 'Ghi chép chiều cao cây trong sân trường và so sánh sự phát triển.',
                output: 'Bảng Google Sheets + biểu đồ',
                weeks: 'Tuần 12-15'
            }
        ],
        guidingDocuments: [
            {
                code: 'CV 3456/HD-BGDĐT',
                title: 'Hướng dẫn triển khai năng lực số',
                summary: 'Quy định cấu phần năng lực số và khuyến nghị tổ chức hoạt động trải nghiệm.',
                application: 'Áp dụng để xây dựng nội quy lớp học số và xác định chỉ báo đánh giá.'
            },
            {
                code: 'Thông tư 02/2025/TT-BGDĐT',
                title: 'Đánh giá học sinh tiểu học',
                summary: 'Yêu cầu đánh giá bằng nhận xét kết hợp sản phẩm học tập.',
                application: 'Thiết kế rubrics và nhật ký minh chứng cho hoạt động số.'
            },
            {
                code: 'Tài liệu phát triển NLS (Final)',
                title: 'Tài liệu phát triển năng lực số tiểu học',
                summary: 'Cung cấp các chủ đề, ví dụ hoạt động và minh chứng chuẩn hoá.',
                application: 'Chọn hoạt động trải nghiệm, phiếu học tập theo từng trụ cột năng lực số.'
            },
            {
                code: 'CT GDPT 2018 - Tin học',
                title: 'Chương trình GDPT 2018 môn Tin học',
                summary: 'Xác định yêu cầu cần đạt về sử dụng thiết bị, ứng dụng phần mềm.',
                application: 'Đảm bảo nội dung Tin học được tích hợp xuyên suốt các chủ đề.'
            }
        ],
        digitalPillars: ['nls_foundation', 'nls_safety', 'nls_data', 'nls_creativity'],
        assessmentPlan: {
            approach: 'Đánh giá vì sự tiến bộ với hồ sơ học tập số',
            methods: ['Phiếu quan sát trực tuyến', 'Sản phẩm số (poster, bảng dữ liệu)', 'Nhật ký phản hồi tự đánh giá'],
            evidence: 'Lưu trữ trên thư mục dùng chung/Google Classroom theo TT 02/2025.'
        },
        sourceNotes: 'Tổng hợp từ CV 3456, TT 02/2025, Tài liệu phát triển NLS (Final) và CT GDPT 2018 môn Tin học.'
    },
    {
        grade: 'Lớp 4',
        summary: 'Tăng cường tư duy dữ liệu, lập trình kéo thả và liên kết dự án STEM với các môn Lịch sử & Địa lí.',
        keyFocus: 'Ứng dụng công cụ số giải quyết vấn đề học tập',
        weeklyStructure: {
            total: '70 tiết/năm (~2 tiết/tuần)',
            digitalTime: '60% thời lượng dành cho dự án trải nghiệm số',
            highlights: [
                'Học kì I: Chuỗi bài lập trình Scratch gắn với câu chuyện lịch sử địa phương',
                'Học kì II: Dự án bản đồ số - khai thác số liệu môi trường',
                'Tổng kết: Diễn đàn chia sẻ sản phẩm số với phụ huynh'
            ]
        },
        competencyTargets: [
            {
                name: 'Tư duy thuật toán cơ bản',
                description: 'Lập trình được chuỗi lệnh, vòng lặp đơn theo CT GDPT 2018.',
                linkedDocuments: ['CT GDPT 2018 môn Tin học', 'Tài liệu phát triển NLS - chủ đề sáng tạo']
            },
            {
                name: 'Khai thác dữ liệu để giải quyết vấn đề',
                description: 'Thu thập thông tin địa lí, lịch sử và trực quan hóa bằng bản đồ số.',
                linkedDocuments: ['CV 3456 mục 3.1', 'Thông tư 02/2025/TT-BGDĐT']
            },
            {
                name: 'Hợp tác số và truyền thông',
                description: 'Phối hợp nhóm, phản hồi trực tuyến theo chuẩn hành vi số.',
                linkedDocuments: ['CV 3456', 'Tài liệu phát triển NLS (Final) - hợp tác số']
            }
        ],
        modules: [
            {
                id: 'l4-1',
                theme: 'Lập trình kể chuyện lịch sử',
                duration: 'Tuần 1-12',
                objectives: [
                    'Viết kịch bản câu chuyện lịch sử lớp 4',
                    'Tạo nhân vật, chuyển động, hiệu ứng âm thanh trong Scratch',
                    'Xuất bản và nhận phản hồi trên lớp học số'
                ],
                digitalFocus: 'Sáng tạo nội dung số - lập trình kéo thả',
                assessment: 'Rubrics đánh giá kịch bản, kỹ thuật lập trình, thông điệp lịch sử',
                resources: ['CT GDPT 2018 Lịch sử & Địa lí', 'CV 3456 mục 3.2', 'Tài liệu phát triển NLS - chủ đề Scratch']
            },
            {
                id: 'l4-2',
                theme: 'Bản đồ số môi trường địa phương',
                duration: 'Tuần 13-24',
                objectives: [
                    'Thu thập số liệu nhiệt độ, lượng mưa từ gia đình/bạn bè',
                    'Nhập dữ liệu lên Google MyMaps hoặc các ứng dụng tương đương',
                    'Phân tích và trình bày phát hiện trước lớp'
                ],
                digitalFocus: 'Tư duy dữ liệu + hợp tác số',
                assessment: 'Bản đồ tương tác + bài thuyết trình nhóm',
                resources: ['Tài liệu phát triển NLS mục dữ liệu', 'CV 3456 - yêu cầu hợp tác số', 'Thông tư 02/2025 - minh chứng sản phẩm']
            },
            {
                id: 'l4-3',
                theme: 'Giải pháp công nghệ cho đời sống',
                duration: 'Tuần 25-35',
                objectives: [
                    'Thiết kế quy trình giải quyết vấn đề thực tiễn (tiết kiệm nước, phân loại rác)',
                    'Lựa chọn công cụ số để minh họa quy trình (video, sơ đồ, chatbot đơn giản)',
                    'Viết báo cáo kết nối kiến thức Khoa học, Đạo đức'
                ],
                digitalFocus: 'Giải quyết vấn đề với công cụ số',
                assessment: 'Hồ sơ dự án + phản hồi của người dùng thử',
                resources: ['CV 3456 - năng lực giải quyết vấn đề', 'CT GDPT 2018 môn Khoa học', 'Tài liệu phát triển NLS Final']
            }
        ],
        digitalProjects: [
            {
                title: 'Triển lãm Scratch kể chuyện lịch sử',
                description: 'Sự kiện trực tuyến giới thiệu sản phẩm của học sinh tới phụ huynh.',
                output: 'Website/Padlet trưng bày',
                weeks: 'Tuần 10-12'
            },
            {
                title: 'Dashboard môi trường địa phương',
                description: 'Sử dụng Google Data Studio hoặc Sheets để theo dõi chỉ số.',
                output: 'Báo cáo trực tuyến',
                weeks: 'Tuần 20-24'
            }
        ],
        guidingDocuments: [
            {
                code: 'CV 3456/HD-BGDĐT',
                title: 'Hướng dẫn triển khai năng lực số',
                summary: 'Nhấn mạnh các hoạt động trải nghiệm STEM và dự án số cho tiểu học.',
                application: 'Định tuyến các module dự án và tiêu chí hợp tác số.'
            },
            {
                code: 'Thông tư 02/2025/TT-BGDĐT',
                title: 'Đánh giá học sinh tiểu học',
                summary: 'Yêu cầu ghi nhận tiến bộ qua sản phẩm và phản hồi.',
                application: 'Thiết kế hồ sơ minh chứng dự án số, nhật kí nhóm.'
            },
            {
                code: 'Tài liệu phát triển NLS (Final)',
                title: 'Tài liệu phát triển năng lực số tiểu học',
                summary: 'Phác thảo chủ đề dữ liệu, lập trình và hợp tác số.',
                application: 'Chọn mẫu hoạt động Scratch, bảng dữ liệu, rubric đánh giá.'
            },
            {
                code: 'CT GDPT 2018 - Tin học',
                title: 'Chương trình GDPT 2018 môn Tin học',
                summary: 'Định nghĩa yêu cầu lập trình kéo thả, sử dụng công cụ số cấp tiểu học.',
                application: 'Đảm bảo chuẩn đầu ra từng học kì và tích hợp liên môn.'
            }
        ],
        digitalPillars: ['nls_creativity', 'nls_data', 'nls_collaboration'],
        assessmentPlan: {
            approach: 'Đánh giá dự án kết hợp phản hồi đồng đẳng',
            methods: ['Bảng kiểm năng lực số', 'Nhật ký nhóm trên Google Docs', 'Bài trình chiếu/bản đồ tương tác'],
            evidence: 'Lưu trữ trên kho minh chứng số của khối 4 theo TT 02/2025.'
        },
        sourceNotes: 'Dựa trên CV 3456, TT 02/2025, Tài liệu phát triển NLS (Final) và CT GDPT 2018 Tin học.'
    },
    {
        grade: 'Lớp 5',
        summary: 'Chuẩn bị chuyển tiếp lên THCS với dự án STEM mở rộng, nhấn mạnh giải quyết vấn đề thực tiễn và năng lực công dân số.',
        keyFocus: 'Tự chủ thiết kế giải pháp số và lan tỏa cộng đồng',
        weeklyStructure: {
            total: '70 tiết/năm (~2 tiết/tuần)',
            digitalTime: '65% thời lượng cho dự án tích hợp và trình bày công khai',
            highlights: [
                'Học kì I: Dự án truyền thông số về chủ đề Đạo đức/Công dân',
                'Học kì II: Giải pháp điều khiển/robot mini hỗ trợ hoạt động trải nghiệm',
                'Tuần 30-35: Hội chợ sản phẩm số cấp trường'
            ]
        },
        competencyTargets: [
            {
                name: 'Thiết kế giải pháp số hoàn chỉnh',
                description: 'Kết hợp lập trình kéo thả, cảm biến đơn giản tạo sản phẩm thực tế.',
                linkedDocuments: ['CT GDPT 2018 Tin học', 'CV 3456 mục 4']
            },
            {
                name: 'Công dân số trách nhiệm',
                description: 'Vận dụng quy định TT 02/2025 để đánh giá rủi ro, bảo vệ bản quyền.',
                linkedDocuments: ['Thông tư 02/2025/TT-BGDĐT', 'Tài liệu phát triển NLS Final - công dân số']
            },
            {
                name: 'Trình bày dữ liệu nâng cao',
                description: 'Phân tích, kể chuyện dữ liệu bằng infographics/video.',
                linkedDocuments: ['Tài liệu phát triển NLS (Final)', 'CV 3456 mục 3.2']
            }
        ],
        modules: [
            {
                id: 'l5-1',
                theme: 'Chiến dịch truyền thông số vì cộng đồng',
                duration: 'Tuần 1-12',
                objectives: [
                    'Khảo sát nhu cầu cộng đồng trường/lớp',
                    'Thiết kế bộ nhận diện, video ngắn tuyên truyền',
                    'Quản trị lịch đăng bài và đo lường tương tác'
                ],
                digitalFocus: 'Công dân số & truyền thông đa phương tiện',
                assessment: 'Bộ sản phẩm truyền thông + báo cáo chỉ số tương tác',
                resources: ['CV 3456 - công dân số', 'TT 02/2025 - minh chứng sản phẩm', 'Tài liệu phát triển NLS Final - truyền thông']
            },
            {
                id: 'l5-2',
                theme: 'Lập trình điều khiển/robot mini',
                duration: 'Tuần 13-25',
                objectives: [
                    'Làm quen cảm biến và khối điều khiển (Micro:bit, Lego Spike)',
                    'Viết chương trình giải quyết bài toán thực tế (an toàn, môi trường)',
                    'Thử nghiệm và cải tiến dựa trên phản hồi'
                ],
                digitalFocus: 'Tư duy thuật toán + sáng tạo công nghệ',
                assessment: 'Sổ tay kỹ thuật + bài thuyết trình kiểm chứng',
                resources: ['CT GDPT 2018 - Tin học nâng cao', 'CV 3456 mục 4.2', 'Tài liệu phát triển NLS Final - STEM']
            },
            {
                id: 'l5-3',
                theme: 'Kể chuyện dữ liệu và báo cáo số',
                duration: 'Tuần 26-35',
                objectives: [
                    'Thu thập dữ liệu cộng đồng (khảo sát thói quen đọc sách, thể thao)',
                    'Thiết kế dashboard/infographic',
                    'Trình bày kết quả và đề xuất giải pháp'
                ],
                digitalFocus: 'Dữ liệu nâng cao và hợp tác số',
                assessment: 'Dashboard + bản thuyết minh + phản hồi của khách mời',
                resources: ['Tài liệu phát triển NLS Final - kể chuyện dữ liệu', 'CV 3456 mục 3', 'TT 02/2025 - hồ sơ minh chứng']
            }
        ],
        digitalProjects: [
            {
                title: 'Hội chợ sản phẩm số lớp 5',
                description: 'Trưng bày robot mini, video truyền thông và infographic dữ liệu.',
                output: 'Sự kiện/hội chợ trực tiếp kết hợp Livestream',
                weeks: 'Tuần 32-35'
            },
            {
                title: 'Thử thách công dân số',
                description: 'Chuỗi thử thách trực tuyến về đạo đức số, bản quyền, bảo mật.',
                output: 'Bảng xếp hạng và huy hiệu số',
                weeks: 'Tuần 8-10'
            }
        ],
        guidingDocuments: [
            {
                code: 'CV 3456/HD-BGDĐT',
                title: 'Hướng dẫn triển khai năng lực số',
                summary: 'Đề xuất mô hình dự án STEM và công dân số cho lớp 5.',
                application: 'Làm căn cứ thiết kế hội chợ sản phẩm và hoạt động tuyên truyền.'
            },
            {
                code: 'Thông tư 02/2025/TT-BGDĐT',
                title: 'Đánh giá học sinh tiểu học',
                summary: 'Quy định minh chứng bắt buộc, hồ sơ học tập khi chuyển cấp.',
                application: 'Chuẩn bị hồ sơ năng lực số cho học sinh cuối cấp.'
            },
            {
                code: 'Tài liệu phát triển NLS (Final)',
                title: 'Tài liệu phát triển năng lực số tiểu học',
                summary: 'Cung cấp chuỗi dự án nâng cao về truyền thông, robot, dữ liệu.',
                application: 'Chọn mẫu dự án phù hợp điều kiện địa phương, điều chỉnh thiết bị.'
            },
            {
                code: 'CT GDPT 2018 - Tin học',
                title: 'Chương trình GDPT 2018 môn Tin học',
                summary: 'Yêu cầu cần đạt giai đoạn kết thúc tiểu học về thuật toán, công nghệ.',
                application: 'Kiểm tra chuẩn bị chuyển tiếp lên THCS.'
            }
        ],
        digitalPillars: ['nls_creativity', 'nls_data', 'nls_collaboration', 'nls_safety'],
        assessmentPlan: {
            approach: 'Đánh giá năng lực tổng hợp thông qua hồ sơ dự án liên môn',
            methods: ['Hồ sơ sản phẩm số', 'Bảng tự đánh giá công dân số', 'Phản biện của khách mời'],
            evidence: 'Số hóa toàn bộ minh chứng và lưu trữ để bàn giao lên cấp THCS.'
        },
        sourceNotes: 'Bám sát CV 3456, TT 02/2025, Tài liệu phát triển NLS Final và CT GDPT 2018 Tin học.'
    }
];
