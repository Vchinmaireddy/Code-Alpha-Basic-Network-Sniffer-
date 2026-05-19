# Basic Network Sniffer

A simple and lightweight network sniffer built using Python. This tool captures network packets and displays useful information such as source IP, destination IP, protocol type, and packet data in real time.

> ⚠️ This project is intended for educational and ethical use only.

---

## Features

- Capture live network traffic
- Display packet details:
  - Source IP Address
  - Destination IP Address
  - Protocol
  - Payload Data
- Simple and beginner-friendly
- Uses raw sockets for packet capturing
- Cross-platform support (with administrator privileges)

---

## Technologies Used

- Python 3
- Socket Programming
- Struct Module

---

## Project Structure

```bash
basic-network-sniffer/
│
├── sniffer.py
├── requirements.txt
└── README.md
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/basic-network-sniffer.git
cd basic-network-sniffer
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

> If there are no external dependencies, this step can be skipped.

---

## Usage

### Linux / macOS

Run the script with root privileges:

```bash
sudo python3 sniffer.py
```

### Windows

Run Command Prompt as Administrator:

```bash
python sniffer.py
```

---

## Example Output

```text
[+] Packet Captured

Source IP      : 192.168.1.5
Destination IP : 142.250.183.14
Protocol       : TCP

Payload:
Hello Network Traffic
--------------------------------------------------
```

---

## How It Works

The program creates a raw socket that listens to incoming and outgoing packets on the network interface. It extracts information from packet headers and displays it in a readable format.

### Concepts Used

- Raw Sockets
- Packet Sniffing
- IP Header Parsing
- TCP/UDP Protocol Analysis
- Network Monitoring

---

## Requirements

- Python 3.x
- Administrator/root privileges
- Supported Operating System:
  - Linux
  - macOS
  - Windows

---

## Educational Purpose

This project is created for:

- Learning networking concepts
- Understanding packet structures
- Practicing Python socket programming
- Cybersecurity and ethical hacking education

Please use this tool only on networks you own or are authorized to monitor.

---

## Future Enhancements

- Add protocol filtering
- Save captured packets to `.pcap`
- Add GUI support
- Display packet statistics
- Decode HTTP/DNS traffic

---

## License

This project is licensed under the MIT License.

---

## Author
vempalla chinmai reddy 
GitHub: https://github.com/your-username
