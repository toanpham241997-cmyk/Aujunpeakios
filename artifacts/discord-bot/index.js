/**
 * Aujunpeak Discord Bot
 * 
 * Quản lý key cho web app Aujunpeak
 * 
 * ENV required:
 *   DISCORD_BOT_TOKEN   - Discord bot token
 *   API_BASE_URL        - URL của API server (vd: https://your-api.onrender.com/api)
 *   BOT_API_SECRET      - Secret để xác thực với API server
 * 
 * ENV optional:
 *   DISCORD_GUILD_ID    - Guild ID để giới hạn ai dùng lệnh
 *   ALLOWED_ROLE_ID     - Role được phép dùng lệnh admin (bỏ trống = tất cả)
 */

import { Client, GatewayIntentBits, EmbedBuilder, Colors } from 'discord.js';

const TOKEN = process.env.DISCORD_BOT_TOKEN;
const API_BASE = (process.env.API_BASE_URL || '').replace(/\/$/, '');
const BOT_SECRET = process.env.BOT_API_SECRET || '';
const ALLOWED_ROLE = process.env.ALLOWED_ROLE_ID || '';

if (!TOKEN) { console.error('DISCORD_BOT_TOKEN is required'); process.exit(1); }
if (!API_BASE) { console.error('API_BASE_URL is required'); process.exit(1); }

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// ── API helper ──────────────────────────────────────────────────────────────
async function api(method, path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'x-bot-secret': BOT_SECRET,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// ── Permissions check ────────────────────────────────────────────────────────
function hasPermission(interaction) {
  if (!ALLOWED_ROLE) return true;
  return interaction.member?.roles?.cache?.has(ALLOWED_ROLE) || false;
}

// ── Format key embed ─────────────────────────────────────────────────────────
function keyEmbed(key, title = 'Thông tin Key') {
  const tier = (key.type || 'free').toUpperCase();
  const color = tier === 'VIP' ? Colors.Yellow : tier === 'CUSTOM' ? Colors.Purple : Colors.Aqua;
  const expiry = key.expiryDate
    ? new Date(key.expiryDate).toLocaleDateString('vi-VN')
    : 'Vĩnh viễn';
  const daysLeft = key.expiryDate
    ? Math.ceil((new Date(key.expiryDate) - Date.now()) / 86400000)
    : null;

  return new EmbedBuilder()
    .setTitle(title)
    .setColor(key.isLocked ? Colors.Red : color)
    .addFields(
      { name: '🔑 Key', value: `\`${key.keyValue}\``, inline: false },
      { name: '📋 Loại', value: tier, inline: true },
      { name: '📅 Hết hạn', value: daysLeft !== null ? `${expiry} (${daysLeft} ngày)` : expiry, inline: true },
      { name: '📱 Thiết bị', value: `${key.deviceCount}/${key.maxDevices}`, inline: true },
      { name: '🔒 Trạng thái', value: key.isLocked ? '🔴 Đã khóa' : '🟢 Hoạt động', inline: true },
      ...(key.notes ? [{ name: '📝 Ghi chú', value: key.notes, inline: false }] : []),
    )
    .setFooter({ text: `ID: ${key.id}` })
    .setTimestamp();
}

// ── Find key by value ─────────────────────────────────────────────────────────
async function findKey(keyValue) {
  const { ok, data } = await api('GET', '/keys?limit=500');
  if (!ok || !Array.isArray(data)) return null;
  return data.find(k => k.keyValue.toLowerCase() === keyValue.toLowerCase()) || null;
}

// ── Command handlers ──────────────────────────────────────────────────────────
const handlers = {

  async createkey(interaction) {
    const type = interaction.options.getString('type');
    const days = interaction.options.getInteger('days');
    const maxDevices = interaction.options.getInteger('max_devices') || 1;
    const keyValue = interaction.options.getString('key_value') || undefined;
    const notes = interaction.options.getString('notes') || undefined;

    const expiryDate = days
      ? new Date(Date.now() + days * 86400000).toISOString().split('T')[0]
      : null;

    await interaction.deferReply({ ephemeral: true });
    const { ok, data } = await api('POST', '/keys', { type, expiryDate, maxDevices, keyValue, notes });

    if (!ok) {
      return interaction.editReply({ content: `❌ Lỗi: ${data.error || 'Không thể tạo key'}` });
    }
    await interaction.editReply({ embeds: [keyEmbed(data, '✅ Key đã được tạo!')] });
  },

  async deletekey(interaction) {
    const keyVal = interaction.options.getString('key');
    await interaction.deferReply({ ephemeral: true });

    const key = await findKey(keyVal);
    if (!key) return interaction.editReply({ content: `❌ Không tìm thấy key: \`${keyVal}\`` });

    const { ok, data } = await api('DELETE', `/keys/${key.id}`);
    if (!ok) return interaction.editReply({ content: `❌ Lỗi: ${data.error}` });

    await interaction.editReply({
      embeds: [new EmbedBuilder().setTitle('🗑️ Key đã xóa').setColor(Colors.Red)
        .setDescription(`Key \`${keyVal}\` đã được xóa vĩnh viễn.`).setTimestamp()],
    });
  },

  async lockkey(interaction) {
    const keyVal = interaction.options.getString('key');
    await interaction.deferReply({ ephemeral: true });

    const key = await findKey(keyVal);
    if (!key) return interaction.editReply({ content: `❌ Không tìm thấy key: \`${keyVal}\`` });

    const { ok, data } = await api('POST', `/keys/${key.id}/lock`);
    if (!ok) return interaction.editReply({ content: `❌ Lỗi: ${data.error}` });

    await interaction.editReply({ embeds: [keyEmbed(data, '🔒 Key đã bị khóa')] });
  },

  async unlockkey(interaction) {
    const keyVal = interaction.options.getString('key');
    await interaction.deferReply({ ephemeral: true });

    const key = await findKey(keyVal);
    if (!key) return interaction.editReply({ content: `❌ Không tìm thấy key: \`${keyVal}\`` });

    const { ok, data } = await api('POST', `/keys/${key.id}/unlock`);
    if (!ok) return interaction.editReply({ content: `❌ Lỗi: ${data.error}` });

    await interaction.editReply({ embeds: [keyEmbed(data, '🔓 Key đã mở khóa')] });
  },

  async renewkey(interaction) {
    const keyVal = interaction.options.getString('key');
    const days = interaction.options.getInteger('days');
    await interaction.deferReply({ ephemeral: true });

    const key = await findKey(keyVal);
    if (!key) return interaction.editReply({ content: `❌ Không tìm thấy key: \`${keyVal}\`` });

    // Calculate new expiry based on existing expiry (or today if expired/no expiry)
    const base = key.expiryDate && new Date(key.expiryDate) > new Date()
      ? new Date(key.expiryDate)
      : new Date();
    const newExpiry = new Date(base.getTime() + days * 86400000).toISOString().split('T')[0];

    const { ok, data } = await api('PUT', `/keys/${key.id}`, { expiryDate: newExpiry });
    if (!ok) return interaction.editReply({ content: `❌ Lỗi: ${data.error}` });

    await interaction.editReply({ embeds: [keyEmbed(data, `✅ Gia hạn thêm ${days} ngày`)] });
  },

  async infokey(interaction) {
    const keyVal = interaction.options.getString('key');
    await interaction.deferReply({ ephemeral: true });

    const key = await findKey(keyVal);
    if (!key) return interaction.editReply({ content: `❌ Không tìm thấy key: \`${keyVal}\`` });

    await interaction.editReply({ embeds: [keyEmbed(key, '🔍 Thông tin Key')] });
  },

  async listkeys(interaction) {
    const type = interaction.options.getString('type');
    await interaction.deferReply({ ephemeral: true });

    const query = type && type !== 'all' ? `?type=${type}&limit=50` : '?limit=50';
    const { ok, data } = await api('GET', `/keys${query}`);

    if (!ok || !Array.isArray(data)) {
      return interaction.editReply({ content: '❌ Không lấy được danh sách key' });
    }

    if (data.length === 0) {
      return interaction.editReply({ content: '📋 Không có key nào.' });
    }

    // Group by type
    const grouped = {};
    data.forEach(k => {
      const t = (k.type || 'free').toUpperCase();
      if (!grouped[t]) grouped[t] = [];
      grouped[t].push(k);
    });

    const typeEmoji = { FREE: '🆓', VIP: '⭐', CUSTOM: '🔧' };

    const lines = data.slice(0, 25).map(k => {
      const status = k.isLocked ? '🔴' : '🟢';
      const exp = k.expiryDate ? new Date(k.expiryDate).toLocaleDateString('vi-VN') : '∞';
      return `${status} \`${k.keyValue}\` · ${(k.type||'free').toUpperCase()} · ${exp} · ${k.deviceCount}/${k.maxDevices} devices`;
    });

    const embed = new EmbedBuilder()
      .setTitle(`📋 Danh sách Key (${data.length})`)
      .setColor(Colors.Blurple)
      .setDescription(lines.join('\n') || 'Không có key')
      .addFields(
        { name: '🆓 Free', value: `${(grouped['FREE'] || []).length}`, inline: true },
        { name: '⭐ VIP', value: `${(grouped['VIP'] || []).length}`, inline: true },
        { name: '🔧 Custom', value: `${(grouped['CUSTOM'] || []).length}`, inline: true },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },

  async editkey(interaction) {
    const keyVal = interaction.options.getString('key');
    const type = interaction.options.getString('type') || undefined;
    const days = interaction.options.getInteger('days');
    const maxDevices = interaction.options.getInteger('max_devices') || undefined;
    const notes = interaction.options.getString('notes') || undefined;

    await interaction.deferReply({ ephemeral: true });

    const key = await findKey(keyVal);
    if (!key) return interaction.editReply({ content: `❌ Không tìm thấy key: \`${keyVal}\`` });

    const update = {};
    if (type) update.type = type;
    if (days) update.expiryDate = new Date(Date.now() + days * 86400000).toISOString().split('T')[0];
    if (maxDevices) update.maxDevices = maxDevices;
    if (notes !== undefined) update.notes = notes;

    if (Object.keys(update).length === 0) {
      return interaction.editReply({ content: '⚠️ Bạn chưa điền gì để cập nhật.' });
    }

    const { ok, data } = await api('PUT', `/keys/${key.id}`, update);
    if (!ok) return interaction.editReply({ content: `❌ Lỗi: ${data.error}` });

    await interaction.editReply({ embeds: [keyEmbed(data, '✏️ Key đã được cập nhật')] });
  },

  async notify(interaction) {
    const target = interaction.options.getString('target');
    const title = interaction.options.getString('title');
    const body = interaction.options.getString('body');
    await interaction.deferReply({ ephemeral: true });

    const { ok, data } = await api('POST', '/notifications', { target, title, body });
    if (!ok) return interaction.editReply({ content: `❌ Lỗi: ${data.error}` });

    const embed = new EmbedBuilder()
      .setTitle('🔔 Thông báo đã gửi')
      .setColor(Colors.Green)
      .addFields(
        { name: 'Đối tượng', value: target === 'all' ? '📢 Tất cả người dùng' : `🎯 Key: \`${target}\``, inline: false },
        { name: 'Tiêu đề', value: title, inline: false },
        { name: 'Nội dung', value: body, inline: false },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },

  async setfreelink(interaction) {
    const link = interaction.options.getString('link');
    await interaction.deferReply({ ephemeral: true });

    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      return interaction.editReply({ content: '❌ Link phải bắt đầu bằng http:// hoặc https://' });
    }

    const { ok, data } = await api('PUT', '/settings/free-key-link', { link });
    if (!ok) return interaction.editReply({ content: `❌ Lỗi: ${data.error}` });

    const embed = new EmbedBuilder()
      .setTitle('🔗 Link Free Key đã cập nhật')
      .setColor(Colors.Aqua)
      .setDescription(`Link mới: ${link}`)
      .setFooter({ text: 'Người dùng app sẽ thấy link này khi nhấn "GET KEY FREE"' })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },

  async help(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('🤖 Aujunpeak Bot - Hướng dẫn')
      .setColor(Colors.Red)
      .setDescription('Quản lý key cho web app Aujunpeak')
      .addFields(
        { name: '🔑 Quản lý Key', value: [
          '`/createkey` — Tạo key mới',
          '`/deletekey` — Xóa key',
          '`/lockkey` — Khóa key',
          '`/unlockkey` — Mở khóa key',
          '`/renewkey` — Gia hạn key',
          '`/editkey` — Chỉnh sửa thông tin key',
          '`/infokey` — Xem thông tin key',
          '`/listkeys` — Liệt kê tất cả key',
        ].join('\n'), inline: false },
        { name: '📢 Thông báo', value: '`/notify` — Gửi thông báo đến app (target: "all" hoặc key cụ thể)', inline: false },
        { name: '🔗 Link Free', value: '`/setfreelink` — Cập nhật link nhận key miễn phí trong app', inline: false },
        { name: '📋 Loại Key', value: '`free` → Mở Home + Settings\n`vip` → Mở toàn bộ tính năng\n`custom` → Mở toàn bộ (tùy chỉnh)', inline: false },
      )
      .setTimestamp();

    await interaction.editReply({ embeds: [embed], ephemeral: true });
  },
};

// ── Events ────────────────────────────────────────────────────────────────────
client.once('ready', () => {
  console.log(`✅ Bot ready: ${client.user.tag}`);
  client.user.setActivity('Aujunpeak Keys', { type: 2 });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // Permission check
  if (!hasPermission(interaction)) {
    return interaction.reply({ content: '❌ Bạn không có quyền dùng lệnh này.', ephemeral: true });
  }

  const handler = handlers[interaction.commandName];
  if (!handler) return;

  try {
    await handler(interaction);
  } catch (err) {
    console.error(`Error in /${interaction.commandName}:`, err);
    const method = interaction.deferred ? 'editReply' : 'reply';
    await interaction[method]({ content: `❌ Lỗi không xác định: ${err.message}`, ephemeral: true }).catch(() => {});
  }
});

client.login(TOKEN);
