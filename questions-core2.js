/* =====================================================================
   FACE-OFF: A+ CORE 2  —  QUESTION POOL
   Exam: CompTIA A+ 220-1102 (Core 2)
   ---------------------------------------------------------------------
   HOW THIS WORKS NOW
   The game is a TOURNAMENT: several boards, teams eliminated between
   them, ending in a head-to-head Lightning Final. So questions live in
   a POOL instead of fixed rounds.

     • 12 categories x 10 clues = 120 board questions
     • Each category's 10 clues run EASIEST (first) to HARDEST (last)
     • The game draws unused clues each round, so no repeats in a game
     • `lightning` = short, fast questions for the final two teams

   HOW TO EDIT
     q   = the question students see
     a   = the answer (host screen only)
     alt = other phrasings you'd accept (host hint, optional)
     obj = CompTIA 220-1102 objective number

   Add or remove clues freely — categories don't have to be exactly 10.
   The engine uses whatever is here and warns you if a board can't fill.
   ===================================================================== */

window.FACEOFF_QUESTIONS = {
  exam: "CompTIA A+ 220-1102 (Core 2)",

  categories: [

  /* ============ 1 ============ */
  { name: "WINDOWS EDITIONS", obj: "1.1, 1.9", clues: [
    { q: "This Windows edition is built for home users and cannot join a domain.",
      a: "Windows Home", alt: ["Home edition"], obj: "1.1" },
    { q: "A 32-bit version of Windows can address a maximum of this much RAM.",
      a: "4 GB", alt: ["4GB"], obj: "1.1" },
    { q: "This type of Windows installation keeps the user's files, settings, AND installed applications.",
      a: "In-place upgrade", alt: ["Upgrade install"], obj: "1.9" },
    { q: "To use Remote Desktop to connect INTO a PC, that PC needs at least this edition.",
      a: "Windows Pro", alt: ["Pro or higher", "Pro/Enterprise"], obj: "1.1" },
    { q: "Available only in Pro and higher, this tool (gpedit.msc) configures local policy settings.",
      a: "Local Group Policy Editor", alt: ["gpedit.msc"], obj: "1.1" },
    { q: "This edition targets power users — it supports the ReFS file system and up to 6 TB of RAM.",
      a: "Windows Pro for Workstations", alt: ["Pro for Workstations"], obj: "1.1" },
    { q: "Name the ONE thing you must always do before starting any OS upgrade.",
      a: "Back up the user's files and settings", alt: ["Back up data"], obj: "1.9" },
    { q: "This partition style is required to boot from a drive larger than 2 TB.",
      a: "GPT", alt: ["GUID Partition Table"], obj: "1.9" },
    { q: "Windows Home lacks BitLocker, but modern Home systems can still encrypt the drive with this feature.",
      a: "Device Encryption", alt: ["BitLocker Device Encryption"], obj: "1.1" },
    { q: "You're moving a user from Windows 10 Pro to Windows 11 Enterprise. Explain why this may require a clean install rather than an in-place upgrade.",
      a: "Enterprise is not a supported in-place upgrade path from Pro — cross-edition/architecture changes need a clean install",
      alt: ["Not a supported upgrade path"], obj: "1.9" }
  ]},

  /* ============ 2 ============ */
  { name: "COMMAND LINE", obj: "1.2", clues: [
    { q: "This command displays the full IP configuration, including subnet mask and default gateway.",
      a: "ipconfig /all", alt: ["ipconfig"], obj: "1.2" },
    { q: "This command lists the files and folders in the current directory.",
      a: "dir", obj: "1.2" },
    { q: "This command traces the route a packet takes and lists every hop along the way.",
      a: "tracert", alt: ["traceroute"], obj: "1.2" },
    { q: "This command scans protected Windows system files and replaces any that are corrupted.",
      a: "sfc /scannow", alt: ["sfc", "System File Checker"], obj: "1.2" },
    { q: "This command maps a drive letter to a network share.",
      a: "net use", obj: "1.2" },
    { q: "This command checks a disk for errors — add /f to fix them and /r to recover readable data.",
      a: "chkdsk", obj: "1.2" },
    { q: "This command shows active network connections and listening ports.",
      a: "netstat", obj: "1.2" },
    { q: "This command queries a DNS server to resolve a hostname to an IP address.",
      a: "nslookup", obj: "1.2" },
    { q: "When sfc can't fix the damage, this command repairs the Windows component store. Give the full command.",
      a: "DISM /Online /Cleanup-Image /RestoreHealth", alt: ["DISM RestoreHealth"], obj: "1.2" },
    { q: "Name the TWO commands that together release and renew a workstation's DHCP address.",
      a: "ipconfig /release and ipconfig /renew", alt: ["release and renew"], obj: "1.2" }
  ]},

  /* ============ 3 ============ */
  { name: "OS TOOLS", obj: "1.3, 1.5", clues: [
    { q: "This Task Manager tab shows which programs launch automatically when Windows boots.",
      a: "Startup", alt: ["Startup tab", "Startup apps"], obj: "1.3" },
    { q: "This utility (diskmgmt.msc) initializes, formats, extends, and shrinks partitions.",
      a: "Disk Management", alt: ["diskmgmt.msc"], obj: "1.3" },
    { q: "This utility (msconfig) enables Safe Boot and controls which services start with Windows.",
      a: "System Configuration", alt: ["msconfig"], obj: "1.3" },
    { q: "This tool schedules a task to run at a set time or trigger.",
      a: "Task Scheduler", obj: "1.3" },
    { q: "This tool (eventvwr.msc) is where you read the System, Application, and Security logs.",
      a: "Event Viewer", alt: ["eventvwr"], obj: "1.3" },
    { q: "This utility rolls the system back to an earlier restore point without touching user files.",
      a: "System Restore", alt: ["rstrui"], obj: "1.3" },
    { q: "This tool (regedit) edits the Windows registry — and this is the one thing you do first.",
      a: "Registry Editor; back up / export the registry first", alt: ["regedit, back it up first"], obj: "1.3" },
    { q: "This console (certmgr.msc) manages the certificates installed for a user.",
      a: "Certificate Manager", alt: ["certmgr.msc"], obj: "1.3" },
    { q: "Name the utility that shows real-time CPU, memory, disk, and network usage per process, beyond what Task Manager shows.",
      a: "Resource Monitor", alt: ["resmon", "Performance Monitor"], obj: "1.3" },
    { q: "A user's PC boots to a black screen. Name the Task Manager feature that lets you launch a program like explorer.exe without a desktop.",
      a: "File > Run new task", alt: ["Run new task", "Create new task"], obj: "1.3" }
  ]},

  /* ============ 4 ============ */
  { name: "CONTROL PANEL", obj: "1.4", clues: [
    { q: "This Control Panel applet is where you rename the PC, change the workgroup, or join a domain.",
      a: "System", alt: ["System Properties", "Computer Name"], obj: "1.4" },
    { q: "This applet is where you uninstall software in Control Panel.",
      a: "Programs and Features", alt: ["Add/Remove Programs"], obj: "1.4" },
    { q: "This feature controls how much a screen's content is enlarged on a high-resolution display.",
      a: "Display scaling", alt: ["Scale and layout", "DPI scaling"], obj: "1.4" },
    { q: "This applet manages saved usernames and passwords for websites and network shares.",
      a: "Credential Manager", obj: "1.4" },
    { q: "These settings decide what the power button does and when the machine sleeps or hibernates.",
      a: "Power Options", alt: ["Power Plans"], obj: "1.4" },
    { q: "This Control Panel applet is where you configure the Windows firewall's inbound and outbound rules.",
      a: "Windows Defender Firewall", alt: ["Windows Firewall"], obj: "1.4" },
    { q: "This applet, labeled Internet Options, has the tabs for Security zones, Privacy, and Connections.",
      a: "Internet Options", alt: ["Internet Properties"], obj: "1.4" },
    { q: "This setting decides whether a user is prompted before an application makes system-level changes.",
      a: "User Account Control (UAC)", alt: ["UAC"], obj: "1.4" },
    { q: "In Ease of Access, name any two features that help a user with a visual impairment.",
      a: "Magnifier, Narrator, High Contrast (any two)", alt: ["Magnifier and Narrator"], obj: "1.4" },
    { q: "A laptop must never sleep during a long software deployment. Name the Power Options change and where you'd make it.",
      a: "Set 'Put the computer to sleep' to Never in the active power plan (Change plan settings)",
      alt: ["Set sleep to Never"], obj: "1.4" }
  ]},

  /* ============ 5 ============ */
  { name: "WINDOWS NETWORKING", obj: "1.6, 1.8", clues: [
    { q: "This protocol automatically assigns IP addresses to clients on a network.",
      a: "DHCP", obj: "1.6" },
    { q: "This address is where a workstation sends traffic destined for another network.",
      a: "Default gateway", obj: "1.6" },
    { q: "This file system is required on a Windows boot volume for file-level permissions and encryption.",
      a: "NTFS", obj: "1.8" },
    { q: "This type of network connection creates an encrypted tunnel to a private network over the internet.",
      a: "VPN", alt: ["Virtual Private Network"], obj: "1.6" },
    { q: "Name the difference between a workgroup and a domain in one sentence.",
      a: "A workgroup is peer-to-peer with local accounts; a domain is centrally managed by a domain controller",
      alt: ["Workgroup = local, domain = central"], obj: "1.6" },
    { q: "A PC shows an address starting with 169.254. What failed, and what is that address called?",
      a: "DHCP failed; that's an APIPA address", alt: ["APIPA", "Automatic Private IP Addressing"], obj: "1.6" },
    { q: "This file system should be used on a flash drive that must work on both Windows and macOS with files over 4 GB.",
      a: "exFAT", obj: "1.8" },
    { q: "Windows asks whether a new network is Public or Private. Explain what actually changes.",
      a: "Private allows network discovery and file/printer sharing; Public hides the PC and blocks sharing",
      alt: ["Discovery and sharing on vs off"], obj: "1.6" },
    { q: "Name the metric that decides which network adapter Windows prefers when a laptop is on both Wi-Fi and Ethernet.",
      a: "Interface metric", alt: ["Metric", "Adapter priority"], obj: "1.6" },
    { q: "A mapped drive keeps disconnecting after reboot. Name the setting that makes it reconnect automatically and where it lives.",
      a: "'Reconnect at sign-in' when mapping the drive (or net use with /persistent:yes)",
      alt: ["Reconnect at sign-in", "/persistent:yes"], obj: "1.6" }
  ]},

  /* ============ 6 ============ */
  { name: "LINUX, macOS & MOBILE", obj: "1.10, 1.11", clues: [
    { q: "This Linux command lists the contents of a directory.",
      a: "ls", obj: "1.11" },
    { q: "This Linux command runs a single command with administrator privileges.",
      a: "sudo", obj: "1.11" },
    { q: "This macOS feature automatically backs up the whole system to an external drive.",
      a: "Time Machine", obj: "1.10" },
    { q: "This Linux command changes a file or folder's permissions.",
      a: "chmod", obj: "1.11" },
    { q: "This macOS feature is the search tool opened with Command + Space.",
      a: "Spotlight", obj: "1.10" },
    { q: "This Linux command shows the full path of the directory you're currently in.",
      a: "pwd", alt: ["print working directory"], obj: "1.11" },
    { q: "This macOS tool manages open windows and virtual desktops (Spaces).",
      a: "Mission Control", obj: "1.10" },
    { q: "In Linux permissions, the number 755 grants what to the owner, the group, and everyone else?",
      a: "Owner: read/write/execute; group and others: read/execute",
      alt: ["rwx r-x r-x"], obj: "1.11" },
    { q: "Name the macOS file extension used for installer packages, and the one for a mountable disk image.",
      a: ".pkg (installer) and .dmg (disk image)", alt: [".pkg and .dmg"], obj: "1.10" },
    { q: "Name the Linux commands to update the package list and then upgrade installed packages on a Debian/Ubuntu system.",
      a: "apt update, then apt upgrade", alt: ["apt-get update / apt-get upgrade"], obj: "1.11" }
  ]},

  /* ============ 7 ============ */
  { name: "SECURITY FUNDAMENTALS", obj: "2.1, 2.5, 2.6", clues: [
    { q: "Requiring a password PLUS a code from your phone is an example of this.",
      a: "Multifactor authentication (MFA)", alt: ["MFA", "2FA"], obj: "2.1" },
    { q: "This security principle says users get only the minimum access needed to do their job.",
      a: "Principle of least privilege", alt: ["Least privilege"], obj: "2.5" },
    { q: "Name BOTH Windows encryption features: one encrypts the whole drive, the other individual files.",
      a: "BitLocker (drive) and EFS (files/folders)", alt: ["BitLocker and EFS"], obj: "2.5" },
    { q: "This built-in account should always be disabled because it allows access without a password.",
      a: "The Guest account", obj: "2.5" },
    { q: "This physical security device secures a laptop to a desk.",
      a: "Cable lock", alt: ["Kensington lock"], obj: "2.1" },
    { q: "This policy locks an account after a set number of failed sign-in attempts, defeating brute force.",
      a: "Failed attempts lockout", alt: ["Account lockout policy"], obj: "2.5" },
    { q: "On the SAME NTFS volume, one operation keeps a file's original permissions and the other inherits the destination's. Name which does which.",
      a: "MOVE keeps original permissions; COPY inherits the destination's",
      alt: ["Move keeps, copy inherits"], obj: "2.5" },
    { q: "When NTFS and share permissions conflict across the network, which one wins?",
      a: "The most restrictive of the two", alt: ["Most restrictive"], obj: "2.5" },
    { q: "Name the small entry area with two locking doors designed to stop tailgating.",
      a: "Access control vestibule", alt: ["Mantrap"], obj: "2.1" },
    { q: "Name the chip on a motherboard that stores the encryption keys BitLocker uses.",
      a: "TPM", alt: ["Trusted Platform Module"], obj: "2.5" }
  ]},

  /* ============ 8 ============ */
  { name: "THREATS & ATTACKS", obj: "2.4", clues: [
    { q: "This social engineering attack uses fraudulent email to trick users into giving up credentials.",
      a: "Phishing", obj: "2.4" },
    { q: "This attack is phishing aimed at one specific high-value target, like a CEO.",
      a: "Whaling", obj: "2.4" },
    { q: "This attack floods a target with traffic from many compromised machines at once.",
      a: "DDoS", alt: ["Distributed Denial of Service"], obj: "2.4" },
    { q: "Following an authorized employee through a secure door without badging in is called this.",
      a: "Tailgating", obj: "2.4" },
    { q: "Watching someone type their password over their shoulder is called this.",
      a: "Shoulder surfing", obj: "2.4" },
    { q: "This attack tries every possible character combination until it finds the password.",
      a: "Brute-force attack", obj: "2.4" },
    { q: "This attack inserts malicious database commands into a web form to read or alter data.",
      a: "SQL injection", alt: ["SQLi"], obj: "2.4" },
    { q: "This attack secretly positions an attacker between two parties who think they're talking directly.",
      a: "On-path attack", alt: ["Man-in-the-middle", "MITM"], obj: "2.4" },
    { q: "This attack injects malicious script into a trusted website so it runs in a visitor's browser.",
      a: "Cross-site scripting", alt: ["XSS"], obj: "2.4" },
    { q: "Explain the difference between a zero-day attack and an attack on an unpatched system.",
      a: "A zero-day exploits a flaw with no vendor patch yet; an unpatched system has an available fix that wasn't applied",
      alt: ["No patch exists vs patch not applied"], obj: "2.4" }
  ]},

  /* ============ 9 ============ */
  { name: "MALWARE & REMOVAL", obj: "2.3, 3.3", clues: [
    { q: "This malware encrypts a victim's files and demands payment for the key.",
      a: "Ransomware", obj: "2.3" },
    { q: "This malware disguises itself as legitimate software to get you to install it.",
      a: "Trojan", alt: ["Trojan horse"], obj: "2.3" },
    { q: "This malware secretly records every key a user presses.",
      a: "Keylogger", obj: "2.3" },
    { q: "This malware spreads across a network by itself, with no user action needed.",
      a: "Worm", obj: "2.3" },
    { q: "This malware type grants admin-level control and hides in the OS kernel or firmware, often surviving a reinstall.",
      a: "Rootkit", obj: "2.3" },
    { q: "In CompTIA's malware removal procedure, name the TWO things you do right after investigating and verifying the symptoms.",
      a: "Quarantine the system, then disable System Restore",
      alt: ["Quarantine and disable System Restore"], obj: "3.3" },
    { q: "Name the LAST two steps of the malware removal procedure, in order.",
      a: "Re-enable System Restore and create a restore point, then educate the end user",
      alt: ["Re-enable System Restore, then educate the user"], obj: "3.3" },
    { q: "Explain why you disable System Restore before cleaning malware.",
      a: "Restore points can hold a copy of the malware and reinfect the machine",
      alt: ["Restore points can be infected"], obj: "3.3" },
    { q: "Name the safest environment to scan and remediate a heavily infected system from, and why.",
      a: "Boot to Safe Mode or an external recovery/preinstallation environment — the malware isn't loaded so it can't defend itself",
      alt: ["Safe Mode", "Recovery environment", "WinRE"], obj: "3.3" },
    { q: "You clean a machine, but the infection returns after every reboot. Name the two most likely culprits.",
      a: "A boot sector/rootkit infection, or a scheduled task or startup entry re-launching it",
      alt: ["Rootkit or a scheduled task/startup item"], obj: "3.3" }
  ]},

  /* ============ 10 ============ */
  { name: "WIRELESS & MOBILE SECURITY", obj: "2.2, 2.7, 2.8, 2.9, 2.10", clues: [
    { q: "This is the strongest current wireless security protocol — it replaces the 4-way handshake with SAE.",
      a: "WPA3", obj: "2.2" },
    { q: "This mobile security feature erases the device after a set number of failed unlock attempts.",
      a: "Remote wipe / failed-attempts wipe", alt: ["Wipe after failed attempts", "Erase data"], obj: "2.8" },
    { q: "This browser feature stops sites from opening extra windows on top of the page.",
      a: "Pop-up blocker", obj: "2.10" },
    { q: "Name the encryption protocol that replaced TKIP and is used by WPA2.",
      a: "AES (with CCMP)", alt: ["AES", "CCMP"], obj: "2.2" },
    { q: "This browser mode keeps no history, cookies, or cached files after the window closes.",
      a: "Private browsing", alt: ["Incognito", "InPrivate"], obj: "2.10" },
    { q: "This authentication server is used for enterprise Wi-Fi so each user logs in with their own credentials.",
      a: "RADIUS", alt: ["RADIUS/TACACS+", "802.1X with RADIUS"], obj: "2.2" },
    { q: "Explain why hiding the SSID is weak security.",
      a: "The SSID is still broadcast in client traffic and is trivially discovered with a wireless scanner",
      alt: ["It's still visible to a sniffer"], obj: "2.9" },
    { q: "Name the padlock's actual meaning in a browser address bar — and what it does NOT tell you.",
      a: "The connection is encrypted with a valid certificate; it does not mean the site is legitimate or safe",
      alt: ["Encrypted, not trustworthy"], obj: "2.10" },
    { q: "This policy lets employees use personal phones for work — name it and the biggest security concern it creates.",
      a: "BYOD; the organization doesn't control the device's patching, apps, or data separation",
      alt: ["BYOD, lack of control"], obj: "2.8" },
    { q: "An iPhone user's device shows apps they never installed and the battery drains fast. Name the most likely root cause and the first fix.",
      a: "The device is jailbroken or has a malicious profile — restore/reset it to factory settings from a known-good backup",
      alt: ["Jailbroken; factory reset"], obj: "2.8" }
  ]},

  /* ============ 11 ============ */
  { name: "SOFTWARE TROUBLESHOOTING", obj: "3.1, 3.2, 3.4, 3.5", clues: [
    { q: "Name step one of CompTIA's troubleshooting methodology.",
      a: "Identify the problem", obj: "3.1" },
    { q: "An application won't start. Name the log you check first in Event Viewer.",
      a: "The Application log", obj: "3.1" },
    { q: "A Windows PC is extremely slow and the disk sits at 100%. Name two likely causes.",
      a: "Too many startup programs, a failing drive, malware, or low RAM causing paging (any two)",
      alt: ["Startup apps, failing disk, malware, low RAM"], obj: "3.1" },
    { q: "This boot option loads Windows with a minimal set of drivers for troubleshooting.",
      a: "Safe Mode", obj: "3.1" },
    { q: "A phone's battery drains unusually fast. Name two things to check first.",
      a: "Apps running in the background, screen brightness/timeout, weak signal, or a failing battery (any two)",
      alt: ["Background apps and brightness"], obj: "3.4" },
    { q: "Windows shows a stop error (BSOD) after installing new hardware. Name the most likely cause and the fix.",
      a: "A bad or incompatible driver — roll back or update the driver in Safe Mode",
      alt: ["Bad driver; roll it back"], obj: "3.1" },
    { q: "Certificate warnings appear on every HTTPS site on one PC only. Name the most likely cause.",
      a: "The system clock date/time is wrong", alt: ["Wrong date and time"], obj: "3.5" },
    { q: "A user's browser redirects searches to an unfamiliar engine and shows constant ads. Name the cause and the fix.",
      a: "A malicious browser extension or hijacker — remove the extension, reset the browser, and scan for malware",
      alt: ["Browser hijack; remove extension and reset"], obj: "3.5" },
    { q: "Name what a corporate app failing to install with 'access denied' most likely needs, and the safest way to give it.",
      a: "Administrative rights — have an admin run the installer, not permanently elevate the user",
      alt: ["Admin rights, run as administrator"], obj: "3.2" },
    { q: "Give steps 5 and 6 of the troubleshooting methodology, in order.",
      a: "5) Verify full system functionality and implement preventive measures  6) Document findings, actions, and outcomes",
      alt: ["Verify then document"], obj: "3.1" }
  ]},

  /* ============ 12 ============ */
  { name: "SAFETY & PROCEDURES", obj: "4.1-4.9", clues: [
    { q: "You wear this to stop electrostatic discharge from destroying components.",
      a: "ESD strap", alt: ["Antistatic wrist strap"], obj: "4.4" },
    { q: "This document must accompany hazardous materials and explains safe handling and disposal.",
      a: "SDS", alt: ["Safety Data Sheet", "MSDS"], obj: "4.5" },
    { q: "This backup rule says: 3 copies of your data, on 2 media types, with 1 copy offsite.",
      a: "3-2-1 backup rule", alt: ["3-2-1 rule"], obj: "4.3" },
    { q: "In change management, this plan describes how to return systems to their previous state if the change fails.",
      a: "Rollback plan", alt: ["Backout plan"], obj: "4.2" },
    { q: "This device keeps a server running through a power outage long enough to shut down safely.",
      a: "UPS", alt: ["Uninterruptible Power Supply"], obj: "4.5" },
    { q: "This documented chain proves who handled evidence and when.",
      a: "Chain of custody", obj: "4.6" },
    { q: "You find prohibited content on a user's machine. Name the first three actions, in order.",
      a: "Report through proper channels, preserve the data and device, document everything",
      alt: ["Report, preserve, document"], obj: "4.6" },
    { q: "Explain the difference between a full backup and an incremental backup in one sentence each.",
      a: "Full copies everything every time; incremental copies only what changed since the last backup of any kind",
      alt: ["Full = everything, incremental = changes since last backup"], obj: "4.3" },
    { q: "Name the difference between a synthetic full backup and a differential backup.",
      a: "A synthetic full is assembled from a previous full plus increments; a differential copies everything changed since the last FULL",
      alt: ["Synthetic is assembled; differential is since last full"], obj: "4.3" },
    { q: "A customer is angry and interrupting you. Name three things professional conduct requires here.",
      a: "Don't argue or be defensive, listen without interrupting, avoid dismissing the concern, and don't take it personally (any three)",
      alt: ["Listen, stay calm, don't argue"], obj: "4.7" }
  ]}

  ],

  /* =====================================================================
     LIGHTNING FINAL — head-to-head between the last two teams.
     Short questions with short answers. 10 seconds each, fastest buzz.
     ===================================================================== */
  lightning: [
    { q: "Which command displays a PC's IP configuration?", a: "ipconfig", obj: "1.2" },
    { q: "What does DHCP hand out to clients?", a: "IP addresses", alt: ["IP configuration"], obj: "1.6" },
    { q: "Which Windows edition can't join a domain?", a: "Home", obj: "1.1" },
    { q: "Which malware encrypts your files for ransom?", a: "Ransomware", obj: "2.3" },
    { q: "What does UAC stand for?", a: "User Account Control", obj: "1.4" },
    { q: "Which Linux command elevates one command to root?", a: "sudo", obj: "1.11" },
    { q: "What's the strongest current Wi-Fi security protocol?", a: "WPA3", obj: "2.2" },
    { q: "Which file system does a Windows boot volume require?", a: "NTFS", obj: "1.8" },
    { q: "What does an address starting 169.254 tell you?", a: "DHCP failed — it's APIPA", alt: ["APIPA"], obj: "1.6" },
    { q: "What's step one of the troubleshooting methodology?", a: "Identify the problem", obj: "3.1" },
    { q: "Which command repairs corrupted Windows system files?", a: "sfc /scannow", alt: ["sfc"], obj: "1.2" },
    { q: "Which chip stores BitLocker's encryption keys?", a: "TPM", obj: "2.5" },
    { q: "Phishing aimed at a CEO is called what?", a: "Whaling", obj: "2.4" },
    { q: "What do you wear to prevent ESD damage?", a: "An ESD/antistatic strap", alt: ["ESD strap"], obj: "4.4" },
    { q: "Which macOS tool backs up the whole system?", a: "Time Machine", obj: "1.10" },
    { q: "What does VPN stand for?", a: "Virtual Private Network", obj: "1.6" },
    { q: "Which boot mode loads minimal drivers?", a: "Safe Mode", obj: "3.1" },
    { q: "Which Linux command changes permissions?", a: "chmod", obj: "1.11" },
    { q: "In the 3-2-1 rule, what does the 1 stand for?", a: "One copy offsite", alt: ["Offsite copy"], obj: "4.3" },
    { q: "Which built-in account should always be disabled?", a: "Guest", obj: "2.5" },
    { q: "Which command traces the path to a remote host?", a: "tracert", obj: "1.2" },
    { q: "Malware that spreads with no user action is called what?", a: "A worm", obj: "2.3" },
    { q: "What does SDS stand for?", a: "Safety Data Sheet", obj: "4.5" },
    { q: "Following someone through a secure door is called what?", a: "Tailgating", obj: "2.4" },
    { q: "Which utility enables Safe Boot from within Windows?", a: "msconfig", alt: ["System Configuration"], obj: "1.3" },
    { q: "Which permission wins when NTFS and share rules conflict?", a: "The most restrictive", obj: "2.5" },
    { q: "What partition style is needed to boot a drive over 2 TB?", a: "GPT", obj: "1.9" },
    { q: "Which command maps a network drive?", a: "net use", obj: "1.2" },
    { q: "What's the last step of the troubleshooting methodology?", a: "Document findings, actions, and outcomes", alt: ["Document"], obj: "3.1" },
    { q: "Which Windows tool reads the System and Security logs?", a: "Event Viewer", obj: "1.3" }
  ]
};
