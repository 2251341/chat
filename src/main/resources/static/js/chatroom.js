var vm = new Vue({
    el: '#app',
    data: function() {
        return {
            roomId: '',
            room: {},
            sender: '',
            message: '',
            photo: null, // New field for the photo file
            messages: [],
            ws: null,
            reconnectAttempts: 0
        };
    },
    created: function() {
        this.roomId = localStorage.getItem('wschat.roomId');
        this.sender = localStorage.getItem('wschat.username');
        if (!this.roomId || !this.sender) {
            console.error("Valid room ID or sender not found in localStorage. Found:", this.roomId, this.sender);
            return;
        }
        this.messages = JSON.parse(localStorage.getItem(`messages_${this.roomId}`)) || [];
        this.initializeWebSocket();
        this.findRoom();
    },
    methods: {
        initializeWebSocket: function() {
            var sock = new SockJS("/ws-stomp");
            this.ws = Stomp.over(sock);
            this.connect();
        },
        connect: function() {
            var vm = this;
            this.ws.connect({}, function(frame) {
                vm.ws.subscribe(`/sub/chat/room/${vm.roomId}`, function(message) {
                    var recv = JSON.parse(message.body);
                    vm.recvMessage(recv);
                });
                vm.ws.send(`/pub/chat/message/${vm.roomId}`, {}, JSON.stringify({
                    type: 'ENTER',
                    roomId: vm.roomId,
                    sender: vm.sender,
                    timestamp: new Date().toISOString()
                }));
            }, function(error) {
                if (vm.reconnectAttempts++ < 5) {
                    setTimeout(vm.connect, 10000);
                    console.log("Attempt to reconnect #" + vm.reconnectAttempts);
                } else {
                    console.error("Failed to reconnect after 5 attempts.");
                }
            });
        },
        findRoom: function() {
            var vm = this;
            axios.get(`/chat/room/${vm.roomId}`).then(function(response) {
                vm.room = response.data;
                document.querySelector('.room-name h2').innerText = vm.room.name;
            }).catch(function(error) {
                console.error('Error fetching room details:', error);
            });
        },
        sendMessage: function() {
            if (!this.message.trim() && !this.photo) return;
            const messagePayload = {
                type: this.photo ? 'PHOTO' : 'TALK',
                roomId: this.roomId,
                sender: this.sender,
                timestamp: new Date().toISOString()
            };
            if (this.photo) {
                var formData = new FormData();
                formData.append('file', this.photo);
                axios.post('/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }).then(response => {
                    messagePayload.photoUrl = response.data;
                    this.ws.send(`/pub/chat/message/${this.roomId}`, {}, JSON.stringify(messagePayload));
                    this.photo = null;
                    this.message = ''; // Clear the message input
                }).catch(error => {
                    console.error('Error uploading photo:', error);
                });
            } else {
                messagePayload.message = this.message.trim();
                this.ws.send(`/pub/chat/message/${this.roomId}`, {}, JSON.stringify(messagePayload));
                this.message = ''; // Clear the message input
            }
        },
        recvMessage: function(recv) {
            const key = `entered_${this.roomId}_${recv.sender}`;
            if (recv.type === 'ENTER' && !localStorage.getItem(key)) {
                localStorage.setItem(key, 'true');
                this.messages.push({
                    type: recv.type,
                    sender: '[알림]',
                    message: `${recv.sender}님이 방에 들어왔습니다.`,
                    timestamp: recv.timestamp
                });
            } else if (recv.type === 'PHOTO') {
                this.messages.push({
                    type: recv.type,
                    sender: recv.sender,
                    photoUrl: recv.photoUrl,
                    timestamp: recv.timestamp
                });
            } else if (recv.type !== 'ENTER') {
                this.messages.push({
                    type: recv.type,
                    sender: recv.sender,
                    message: recv.message,
                    timestamp: recv.timestamp
                });
            }
            this.$nextTick(() => {
                var container = this.$el.querySelector('.wrap');
                container.scrollTop = container.scrollHeight;
            });
            localStorage.setItem(`messages_${this.roomId}`, JSON.stringify(this.messages));
        },
        handlePhotoChange: function(event) {
            const file = event.target.files[0];
            this.photo = file;
            if (file) {
                this.message = `Selected file: ${file.name}`;
            }
        },
        handleKeyPress: function(event) {
            if (event.key === 'ENTER') {
                this.sendMessage();
            }
        }

    }
});