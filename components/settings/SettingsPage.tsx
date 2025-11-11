import React, { useState } from 'react';
import { IconUsers, IconCalendar, IconBook, IconPrinter, IconClock, IconBell, IconGrid, IconChart, IconShield, IconDatabase, IconSave, IconTrash, IconGoogleDrive, IconPlus } from '../ui/Icons';
import type { AcademicYear, CategoryItem } from '../../types';

// --- Modal for Adding Academic Year ---
interface AddAcademicYearModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (yearName: string) => void;
}

const AddAcademicYearModal: React.FC<AddAcademicYearModalProps> = ({ isOpen, onClose, onSave }) => {
    const [yearName, setYearName] = useState('');

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(yearName);
        setYearName(''); // Reset for next time
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center">
            <div className="relative mx-auto p-6 border w-full max-w-sm shadow-lg rounded-md bg-white">
                <div className="mt-3">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 text-center">Thêm Năm học Mới</h3>
                    <div className="mt-4">
                        <label htmlFor="yearName" className="block text-sm font-medium text-gray-700">Tên năm học</label>
                        <input
                            type="text"
                            id="yearName"
                            value={yearName}
                            onChange={(e) => setYearName(e.target.value)}
                            placeholder="VD: 2025-2026"
                            className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                    </div>
                    <div className="items-center px-4 py-3 mt-4 flex justify-end space-x-4 bg-gray-50 -mx-6 -mb-6 rounded-b-md">
                        <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300">
                            Hủy bỏ
                        </button>
                        <button onClick={handleSave} className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <IconSave />
                            <span className="ml-2">Lưu</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- UI Components for each setting ---
const SettingCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
    <div>
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <p className="mt-1 text-sm text-gray-500 mb-6">{description}</p>
        <div className="space-y-6">{children}</div>
    </div>
);

// New component for Drive integration
interface GoogleDriveIntegrationProps {
    isConnected: boolean;
    user: { email: string; name: string } | null;
    onConnect: () => void;
    onDisconnect: () => void;
}
const GoogleDriveIntegration: React.FC<GoogleDriveIntegrationProps> = ({ isConnected, user, onConnect, onDisconnect }) => (
    <SettingCard title="🔗 Liên kết Google Drive" description="Kết nối tài khoản Google Drive để lưu trữ và truy cập đề thi, tài liệu từ mọi nơi.">
        {isConnected && user ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                <div>
                    <p className="font-semibold text-green-800">Đã kết nối với Google Drive</p>
                    <p className="text-sm text-gray-600">Tài khoản: {user.email}</p>
                </div>
                <button onClick={onDisconnect} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50">Ngắt kết nối</button>
            </div>
        ) : (
            <div className="p-4 bg-gray-100 border rounded-lg flex items-center justify-between">
                <div>
                    <p className="font-semibold text-gray-800">Chưa kết nối</p>
                    <p className="text-sm text-gray-600">Kết nối để sao lưu và đồng bộ dữ liệu.</p>
                </div>
                <button onClick={onConnect} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700">
                    <IconGoogleDrive />
                    <span className="ml-2">Kết nối</span>
                </button>
            </div>
        )}
    </SettingCard>
);

const RolePermissionManagement = () => (
    <SettingCard title="👤 Quản lý Phân quyền và Vai trò" description="Tạo ra các vai trò tùy chỉnh và gán các quyền hạn chi tiết cho từng vai trò.">
        <div className="flex justify-end">
             <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">Tạo vai trò mới</button>
        </div>
        <table className="min-w-full bg-white rounded-lg shadow">
            <thead className="bg-gray-100">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vai trò</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mô tả</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
                <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Chuyên viên môn Toán</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Xem báo cáo, tải đề thi môn Toán</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><a href="#" className="text-indigo-600 hover:text-indigo-900">Sửa</a></td>
                </tr>
                 <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Lãnh đạo Sở</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Toàn quyền xem báo cáo, tạo thông báo</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium"><a href="#" className="text-indigo-600 hover:text-indigo-900">Sửa</a></td>
                </tr>
            </tbody>
        </table>
    </SettingCard>
);

interface AcademicYearManagementProps {
    academicYears: AcademicYear[];
    onAddYear: (name: string) => void;
    onSetCurrent: (id: string) => void;
    onDelete: (id: string) => void;
}
const AcademicYearManagement: React.FC<AcademicYearManagementProps> = ({ academicYears, onAddYear, onSetCurrent, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <SettingCard title="🗓️ Quản lý Năm học và Học kỳ" description="Thiết lập các mốc thời gian quan trọng, giúp hệ thống tổ chức và lọc dữ liệu.">
            <AddAcademicYearModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={(name) => {
                    onAddYear(name);
                    setIsModalOpen(false);
                }} 
            />
            <div className="flex justify-end">
                <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">Thêm năm học mới</button>
            </div>
            <table className="min-w-full bg-white rounded-lg shadow">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Năm học</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {academicYears.map(year => (
                        <tr key={year.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{year.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {year.isCurrent ? (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                        Hiện tại
                                    </span>
                                ) : (
                                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                        Đã lưu trữ
                                    </span>
                                )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex justify-end items-center space-x-4">
                                    {!year.isCurrent ? (
                                        <button onClick={() => onSetCurrent(year.id)} className="text-indigo-600 hover:text-indigo-900">
                                            Đặt làm năm hiện tại
                                        </button>
                                    ) : <div />}
                                    {!year.isCurrent && academicYears.length > 1 && (
                                        <button 
                                            onClick={() => onDelete(year.id)} 
                                            className="text-red-600 hover:text-red-900"
                                            title={`Xóa năm học ${year.name}`}
                                        >
                                            <IconTrash className="h-5 w-5" />
                                        </button>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </SettingCard>
    );
};

interface CategorySectionProps {
    title: string;
    items: CategoryItem[];
    onAdd: (name: string) => void;
    onDelete: (id: string) => void;
    placeholder: string;
}
const CategorySection: React.FC<CategorySectionProps> = ({ title, items, onAdd, onDelete, placeholder }) => {
    const [newItemName, setNewItemName] = useState('');
    const handleAdd = () => {
        if (newItemName.trim()) {
            onAdd(newItemName.trim());
            setNewItemName('');
        }
    };
    return (
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-3">{title}</h3>
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto pr-2">
                {items.length > 0 ? items.map(item => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-md">
                        <span className="text-sm text-gray-700">{item.name}</span>
                        <button onClick={() => onDelete(item.id)} className="p-1 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-100 transition-colors" title={`Xóa ${item.name}`}>
                            <IconTrash className="h-4 w-4" />
                        </button>
                    </div>
                )) : <p className="text-sm text-gray-400 italic text-center">Chưa có mục nào.</p>}
            </div>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAdd(); } }}
                    placeholder={placeholder}
                    className="flex-grow block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
                <button onClick={handleAdd} className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
                    <IconPlus className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
};
interface SharedCategoriesManagementProps {
    subjects: CategoryItem[];
    gradeLevels: CategoryItem[];
    examTypes: CategoryItem[];
    onCategoryChange: (category: 'subjects' | 'gradeLevels' | 'examTypes', action: 'add' | 'delete', payload: { id?: string; name?: string }) => void;
}
const SharedCategoriesManagement: React.FC<SharedCategoriesManagementProps> = ({ subjects, gradeLevels, examTypes, onCategoryChange }) => {
    return (
        <div className="space-y-6">
            <CategorySection
                title="Môn học"
                items={subjects}
                onAdd={(name) => onCategoryChange('subjects', 'add', { name })}
                onDelete={(id) => onCategoryChange('subjects', 'delete', { id })}
                placeholder="VD: Âm nhạc"
            />
            <CategorySection
                title="Khối lớp"
                items={gradeLevels}
                onAdd={(name) => onCategoryChange('gradeLevels', 'add', { name })}
                onDelete={(id) => onCategoryChange('gradeLevels', 'delete', { id })}
                placeholder="VD: Lớp 1"
            />
            <CategorySection
                title="Loại bài kiểm tra"
                items={examTypes}
                onAdd={(name) => onCategoryChange('examTypes', 'add', { name })}
                onDelete={(id) => onCategoryChange('examTypes', 'delete', { id })}
                placeholder="VD: Kiểm tra 15 phút"
            />
        </div>
    );
};

const PrintTemplatesManagement = () => (
    <SettingCard title="📄 Quản lý Mẫu in và Tiêu đề" description="Đảm bảo tất cả các đề thi được in ra theo một định dạng chuẩn, chuyên nghiệp.">
        <div>
            <label className="block text-sm font-medium text-gray-700">Tải lên logo của Sở GDĐT</label>
            <input type="file" className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"/>
        </div>
        <div>
            <label className="block text-sm font-medium text-gray-700">Mẫu Tiêu đề (Header)</label>
            <textarea rows={4} className="mt-1 shadow-sm block w-full sm:text-sm border-gray-300 rounded-md" defaultValue={"SỞ GIÁO DỤC VÀ ĐÀO TẠO TỈNH [TÊN TỈNH]\nTRƯỜNG: [TÊN TRƯỜNG]\nBÀI KIỂM TRA [TÊN BÀI KIỂM TRA]"} />
        </div>
    </SettingCard>
);
const DeadlinesRulesManagement = () => <SettingCard title="⏰ Thiết lập Thời hạn và Quy định" description="Đặt ra các quy tắc và giới hạn thời gian chung cho việc nộp và duyệt đề thi."><p className="text-gray-700">Giao diện cài đặt hạn chót, bật/tắt tính năng chỉnh sửa sẽ được hiển thị tại đây.</p></SettingCard>;
const NotificationSettings = () => <SettingCard title="🔔 Cấu hình Thông báo Tự động" description="Quản lý các luồng thông báo qua email hoặc thông báo trong ứng dụng."><p className="text-gray-700">Giao diện bật/tắt email thông báo, thiết lập email nhắc nhở sẽ được hiển thị tại đây.</p></SettingCard>;
const StandardMatrixTemplates = () => <SettingCard title="📝 Quản lý Mẫu Ma trận Đề Chuẩn" description="Cung cấp các ma trận đề thi tham khảo chuẩn do Sở ban hành."><p className="text-gray-700">Giao diện tạo và lưu các mẫu ma trận đề theo từng môn, khối lớp sẽ được hiển thị tại đây.</p></SettingCard>;
const ReportStatisticsConfig = () => <SettingCard title="📈 Cấu hình Báo cáo và Thống kê" description="Cho phép tùy chỉnh các tham số và định dạng cho các báo cáo."><p className="text-gray-700">Giao diện thiết lập các ngưỡng cảnh báo, lựa chọn các chỉ số mặc định sẽ được hiển thị tại đây.</p></SettingCard>;
const SystemActivityLog = () => <SettingCard title="🛡️ Nhật ký Hoạt động Hệ thống" description="Ghi lại mọi thay đổi quan trọng trên hệ thống để giám sát và truy vết."><p className="text-gray-700">Giao diện xem lịch sử đăng nhập, theo dõi ai đã tạo/duyệt/từ chối đề thi sẽ được hiển thị tại đây.</p></SettingCard>;
const BackupRestore = () => (
    <SettingCard title="💾 Sao lưu & Phục hồi Dữ liệu" description="Đảm bảo an toàn dữ liệu cho toàn bộ hệ thống.">
         <div className="flex space-x-4">
             <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700">Sao lưu thủ công</button>
             {/* FIX: The button was incomplete. Completed the button element. */}
             <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50">Phục hồi từ tệp...</button>
         </div>
    </SettingCard>
);

// FIX: Define and export the SettingsPage component. This component was missing an export, causing an error in App.tsx.
interface SettingsPageProps {
    onBack: () => void;
    academicYears: AcademicYear[];
    onAddAcademicYear: (name: string) => void;
    onSetCurrentAcademicYear: (id: string) => void;
    onDeleteAcademicYear: (id: string) => void;
    isDriveConnected: boolean;
    driveUser: { email: string; name: string } | null;
    onDriveConnect: () => void;
    onDriveDisconnect: () => void;
    subjects: CategoryItem[];
    gradeLevels: CategoryItem[];
    examTypes: CategoryItem[];
    onCategoryChange: (category: 'subjects' | 'gradeLevels' | 'examTypes', action: 'add' | 'delete', payload: { id?: string; name?: string }) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ 
    onBack,
    academicYears, onAddAcademicYear, onSetCurrentAcademicYear, onDeleteAcademicYear,
    isDriveConnected, driveUser, onDriveConnect, onDriveDisconnect,
    subjects, gradeLevels, examTypes, onCategoryChange
 }) => {
    const [activeTab, setActiveTab] = useState('general');

    const tabs = [
        { id: 'general', label: 'Liên kết & Vai trò', icon: <IconUsers className="w-5 h-5 mr-3" /> },
        { id: 'academic', label: 'Năm học', icon: <IconCalendar className="w-5 h-5 mr-3" /> },
        { id: 'categories', label: 'Danh mục', icon: <IconBook className="w-5 h-5 mr-3" /> },
        { id: 'templates', label: 'Mẫu in', icon: <IconPrinter className="w-5 h-5 mr-3" /> },
        { id: 'deadlines', label: 'Thời hạn', icon: <IconClock className="w-5 h-5 mr-3" /> },
        { id: 'notifications', label: 'Thông báo', icon: <IconBell className="w-5 h-5 mr-3" /> },
        { id: 'matrix', label: 'Ma trận chuẩn', icon: <IconGrid className="w-5 h-5 mr-3" /> },
        { id: 'reports', label: 'Báo cáo', icon: <IconChart className="w-5 h-5 mr-3" /> },
        { id: 'security', label: 'Bảo mật', icon: <IconShield className="w-5 h-5 mr-3" /> },
        { id: 'data', label: 'Dữ liệu', icon: <IconDatabase className="w-5 h-5 mr-3" /> },
    ];
    
    return (
        <div className="bg-white/60 backdrop-blur-lg rounded-2xl shadow-lg p-6 sm:p-8 max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 border-b pb-4 mb-8">
                Cài đặt & Tùy chỉnh Hệ thống
            </h1>
    
            <div className="flex flex-col md:flex-row gap-8">
                {/* --- Sidebar for Tabs --- */}
                <div className="md:w-1/4">
                    <nav className="flex flex-col space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg text-left transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-indigo-100 text-indigo-700'
                                        : 'text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>
    
                {/* --- Content Area --- */}
                <div className="md:w-3/4">
                    <div className="space-y-12">
                        {activeTab === 'general' && (
                            <div className="space-y-12">
                                <GoogleDriveIntegration
                                    isConnected={isDriveConnected}
                                    user={driveUser}
                                    onConnect={onDriveConnect}
                                    onDisconnect={onDriveDisconnect}
                                />
                                <RolePermissionManagement />
                            </div>
                        )}
    
                        {activeTab === 'academic' && (
                            <AcademicYearManagement 
                                academicYears={academicYears} 
                                onAddYear={onAddAcademicYear} 
                                onSetCurrent={onSetCurrentAcademicYear}
                                onDelete={onDeleteAcademicYear}
                            />
                        )}
    
                        {activeTab === 'categories' && (
                            <SettingCard title="🗂️ Quản lý Danh mục dùng chung" description="Thêm, sửa, xóa các danh mục để tái sử dụng trong toàn bộ hệ thống.">
                                <SharedCategoriesManagement 
                                    subjects={subjects}
                                    gradeLevels={gradeLevels}
                                    examTypes={examTypes}
                                    onCategoryChange={onCategoryChange}
                                />
                            </SettingCard>
                        )}
                        
                        {activeTab === 'templates' && <PrintTemplatesManagement />}
                        {activeTab === 'deadlines' && <DeadlinesRulesManagement />}
                        {activeTab === 'notifications' && <NotificationSettings />}
                        {activeTab === 'matrix' && <StandardMatrixTemplates />}
                        {activeTab === 'reports' && <ReportStatisticsConfig />}
                        {activeTab === 'security' && <SystemActivityLog />}
                        {activeTab === 'data' && <BackupRestore />}
                    </div>
                </div>
            </div>
        </div>
    );
};