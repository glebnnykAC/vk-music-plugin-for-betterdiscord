/**
 * @name VKMusicIntegration
 * @version 1.0.0
 * @description Displays your currently playing VK Music track as your Discord status.
 * @author YourName
 */

module.exports = class VKMusicIntegration {
    constructor() {
        this.currentTrack = null;
        this.updateInterval = null;
        this.vkToken = 'your_vk_api_token'; // Ваш токен VK
        this.userId = 'user_id'; // ID пользователя
    }

    start() {
        this.updateStatus();
        this.updateInterval = setInterval(this.updateStatus.bind(this), 15000); // обновлять каждые 15 секунд
    }

    stop() {
        clearInterval(this.updateInterval);
        this.clearStatus();
    }

    async updateStatus() {
        const track = await this.getCurrentTrack();

        if (track && track !== this.currentTrack) {
            this.currentTrack = track;
            this.setStatus(track);
        } else if (!track) {
            this.clearStatus();
        }
    }

    async getCurrentTrack() {
        const apiUrl = `https://api.vk.com/method/audio.get?owner_id=${this.userId}&access_token=${this.vkToken}&v=5.131`;

        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            if (data.response && data.response[0]) {
                const track = data.response[0];
                return `${track.artist} - ${track.title}`;
            }
        } catch (error) {
            console.error('Error fetching VK music data:', error);
        }
        return null;
    }

    setStatus(track) {
        BdApi.findModuleByProps('updateRemoteSettings').updateRemoteSettings({
            customStatus: {
                text: track,
                expires_at: null
            }
        });
    }

    clearStatus() {
        BdApi.findModuleByProps('updateRemoteSettings').updateRemoteSettings({
            customStatus: {
                text: '',
                expires_at: null
            }
        });
    }
};
