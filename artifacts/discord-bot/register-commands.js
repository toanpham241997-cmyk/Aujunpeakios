/**
 * Run once to register slash commands:
 * node register-commands.js
 * 
 * Requires env: DISCORD_BOT_TOKEN, DISCORD_CLIENT_ID, DISCORD_GUILD_ID (optional, for guild-specific)
 */
import { REST, Routes } from 'discord.js';

const token = process.env.DISCORD_BOT_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;
const guildId = process.env.DISCORD_GUILD_ID;

if (!token || !clientId) {
  console.error('DISCORD_BOT_TOKEN and DISCORD_CLIENT_ID are required');
  process.exit(1);
}

const commands = [
  {
    name: 'createkey',
    description: 'Tạo key mới',
    options: [
      { name: 'type', description: 'Loại key (free/vip/custom)', type: 3, required: true, choices: [
        { name: 'Free', value: 'free' },
        { name: 'VIP', value: 'vip' },
        { name: 'Custom', value: 'custom' },
      ]},
      { name: 'days', description: 'Số ngày hết hạn (bỏ trống = vĩnh viễn)', type: 4, required: false },
      { name: 'max_devices', description: 'Số thiết bị tối đa (mặc định 1)', type: 4, required: false },
      { name: 'key_value', description: 'Giá trị key tùy chỉnh (bỏ trống = tự tạo)', type: 3, required: false },
      { name: 'notes', description: 'Ghi chú', type: 3, required: false },
    ],
  },
  {
    name: 'deletekey',
    description: 'Xóa key',
    options: [
      { name: 'key', description: 'Giá trị key cần xóa', type: 3, required: true },
    ],
  },
  {
    name: 'lockkey',
    description: 'Khóa key',
    options: [
      { name: 'key', description: 'Giá trị key cần khóa', type: 3, required: true },
    ],
  },
  {
    name: 'unlockkey',
    description: 'Mở khóa key',
    options: [
      { name: 'key', description: 'Giá trị key cần mở khóa', type: 3, required: true },
    ],
  },
  {
    name: 'renewkey',
    description: 'Gia hạn key thêm số ngày',
    options: [
      { name: 'key', description: 'Giá trị key cần gia hạn', type: 3, required: true },
      { name: 'days', description: 'Số ngày muốn thêm', type: 4, required: true },
    ],
  },
  {
    name: 'infokey',
    description: 'Xem thông tin key',
    options: [
      { name: 'key', description: 'Giá trị key', type: 3, required: true },
    ],
  },
  {
    name: 'listkeys',
    description: 'Liệt kê tất cả key',
    options: [
      { name: 'type', description: 'Lọc theo loại (free/vip/custom)', type: 3, required: false, choices: [
        { name: 'Tất cả', value: 'all' },
        { name: 'Free', value: 'free' },
        { name: 'VIP', value: 'vip' },
        { name: 'Custom', value: 'custom' },
      ]},
    ],
  },
  {
    name: 'editkey',
    description: 'Chỉnh sửa thông tin key',
    options: [
      { name: 'key', description: 'Giá trị key cần sửa', type: 3, required: true },
      { name: 'type', description: 'Loại key mới', type: 3, required: false, choices: [
        { name: 'Free', value: 'free' },
        { name: 'VIP', value: 'vip' },
        { name: 'Custom', value: 'custom' },
      ]},
      { name: 'days', description: 'Đặt hạn N ngày từ bây giờ', type: 4, required: false },
      { name: 'max_devices', description: 'Số thiết bị tối đa', type: 4, required: false },
      { name: 'notes', description: 'Ghi chú mới', type: 3, required: false },
    ],
  },
  {
    name: 'notify',
    description: 'Gửi thông báo đến app',
    options: [
      { name: 'target', description: '"all" hoặc giá trị key cụ thể', type: 3, required: true },
      { name: 'title', description: 'Tiêu đề thông báo', type: 3, required: true },
      { name: 'body', description: 'Nội dung thông báo', type: 3, required: true },
    ],
  },
  {
    name: 'setfreelink',
    description: 'Cập nhật link nhận key miễn phí',
    options: [
      { name: 'link', description: 'Link mới (URL đầy đủ)', type: 3, required: true },
    ],
  },
  {
    name: 'help',
    description: 'Hiển thị danh sách lệnh',
  },
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Registering slash commands...');
    const route = guildId
      ? Routes.applicationGuildCommands(clientId, guildId)
      : Routes.applicationCommands(clientId);

    await rest.put(route, { body: commands });
    console.log('✅ Commands registered successfully!');
    console.log(guildId ? `Guild: ${guildId}` : 'Global commands (may take up to 1 hour to propagate)');
  } catch (err) {
    console.error('Failed to register commands:', err);
    process.exit(1);
  }
})();
