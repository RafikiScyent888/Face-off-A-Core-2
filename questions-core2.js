/* =====================================================================
   FACE-OFF: A+ CORE 2  —  QUESTION BANK
   Exam: CompTIA A+ 220-1102 (Core 2)
   ---------------------------------------------------------------------
   HOW TO EDIT:
     • Each round has exactly 6 categories.
     • Each category has exactly 5 clues, in order: 100/200/300/400/500
       (Round 2 auto-doubles to 200/400/600/800/1000).
     • q   = the question shown on screen
     • a   = the accepted answer (shown to the HOST only, for judging)
     • alt = optional list of other phrasings you'd accept (host hint)
     • obj = CompTIA objective number (shown to host, and on the recap)
   Daily Doubles are placed RANDOMLY each game — you do not set them here.
   ===================================================================== */

window.FACEOFF_QUESTIONS = {
  exam: "CompTIA A+ 220-1102 (Core 2)",

  /* ================= ROUND 1 ================= */
  round1: [
    {
      name: "WINDOWS EDITIONS",
      clues: [
        { q: "This Windows 10/11 edition is built for home users and cannot join a domain, host Remote Desktop, or use BitLocker.",
          a: "Windows Home", alt: ["Windows 10 Home", "Home edition"], obj: "1.1" },
        { q: "Available only in Pro and higher, this tool (gpedit.msc) lets an admin configure local policy settings.",
          a: "Local Group Policy Editor", alt: ["gpedit.msc", "Group Policy Editor"], obj: "1.1" },
        { q: "This type of Windows installation keeps the user's files, settings, AND installed applications.",
          a: "In-place upgrade", alt: ["Upgrade install"], obj: "1.9" },
        { q: "A 32-bit version of Windows can address a maximum of this much RAM.",
          a: "4 GB", alt: ["4GB", "four gigabytes"], obj: "1.1" },
        { q: "This edition targets power users with high-end hardware — it supports the ReFS file system, persistent memory, and up to 6 TB of RAM.",
          a: "Windows Pro for Workstations", alt: ["Pro for Workstations"], obj: "1.1" }
      ]
    },
    {
      name: "COMMAND LINE",
      clues: [
        { q: "This command displays the full IP configuration, including subnet mask, default gateway, DNS servers, and MAC address.",
          a: "ipconfig /all", alt: ["ipconfig"], obj: "1.2" },
        { q: "This command traces the route a packet takes to a destination and lists every hop along the way.",
          a: "tracert", alt: ["traceroute"], obj: "1.2" },
        { q: "This command scans all protected Windows system files and replaces any that are corrupted.",
          a: "sfc /scannow", alt: ["sfc", "System File Checker"], obj: "1.2" },
        { q: "This command maps a drive letter to a network share — for example, mapping Z: to \\\\server\\data.",
          a: "net use", obj: "1.2" },
        { q: "When sfc can't fix the damage, this command repairs the underlying Windows component store. Give the full command.",
          a: "DISM /Online /Cleanup-Image /RestoreHealth", alt: ["DISM RestoreHealth", "DISM"], obj: "1.2" }
      ]
    },
    {
      name: "OS TOOLS & SETTINGS",
      clues: [
        { q: "This utility (diskmgmt.msc) is used to initialize, format, extend, shrink, and assign letters to partitions.",
          a: "Disk Management", alt: ["diskmgmt.msc"], obj: "1.3" },
        { q: "This Task Manager tab shows which programs launch automatically when Windows boots — and lets you disable them.",
          a: "Startup", alt: ["Startup tab", "Startup apps"], obj: "1.3" },
        { q: "This utility (msconfig) lets you enable Safe Boot and control which services start with Windows.",
          a: "System Configuration", alt: ["msconfig"], obj: "1.3" },
        { q: "This Control Panel applet is where you rename the PC, change the workgroup, or join a domain.",
          a: "System", alt: ["System Properties", "Computer Name tab", "Control Panel > System"], obj: "1.4" },
        { q: "This file system is required on a Windows boot volume if you need file-level permissions, EFS encryption, and compression.",
          a: "NTFS", obj: "1.8" }
      ]
    },
    {
      name: "SECURITY CONCEPTS",
      clues: [
        { q: "Requiring a password PLUS a code from your phone is an example of this authentication method.",
          a: "Multifactor authentication (MFA)", alt: ["MFA", "2FA", "Two-factor authentication"], obj: "2.1" },
        { q: "Name BOTH Windows encryption features: one encrypts the entire drive, the other encrypts individual files and folders.",
          a: "BitLocker (full drive) and EFS (files/folders)", alt: ["BitLocker and EFS"], obj: "2.5" },
        { q: "This is the strongest current wireless security protocol — it replaces the 4-way handshake with SAE.",
          a: "WPA3", obj: "2.2" },
        { q: "This security principle says users should get only the minimum access required to do their job.",
          a: "Principle of least privilege", alt: ["Least privilege"], obj: "2.5" },
        { q: "On the SAME NTFS volume, one of these operations keeps the file's original permissions and the other inherits the destination's. Name which does which.",
          a: "MOVE keeps original permissions; COPY inherits the destination's permissions", alt: ["Move keeps, copy inherits"], obj: "2.5" }
      ]
    },
    {
      name: "MALWARE & SOCIAL ENGINEERING",
      clues: [
        { q: "This malware encrypts a victim's files and demands payment for the decryption key.",
          a: "Ransomware", obj: "2.3" },
        { q: "This social engineering attack is a phishing campaign aimed at one specific high-value target, like a CEO or CFO.",
          a: "Whaling", obj: "2.4" },
        { q: "This attack floods a target with traffic from many compromised machines at the same time — often a botnet.",
          a: "DDoS", alt: ["Distributed Denial of Service"], obj: "2.4" },
        { q: "In CompTIA's malware removal procedure, name the TWO things you do immediately after investigating and verifying the symptoms.",
          a: "Quarantine the infected system, then disable System Restore", alt: ["Quarantine and disable System Restore"], obj: "3.3" },
        { q: "This malware type grants attacker-level admin control and hides itself in the OS kernel or firmware, often surviving a reinstall.",
          a: "Rootkit", obj: "2.3" }
      ]
    },
    {
      name: "SAFETY & PROCEDURES",
      clues: [
        { q: "You wear this to prevent electrostatic discharge from destroying components while you work.",
          a: "ESD strap", alt: ["Antistatic wrist strap", "ESD wrist strap"], obj: "4.4" },
        { q: "This document must accompany hazardous materials and explains safe handling, storage, and disposal.",
          a: "SDS", alt: ["Safety Data Sheet", "MSDS"], obj: "4.5" },
        { q: "In change management, this plan describes how to return systems to their previous state if the change fails.",
          a: "Rollback plan", alt: ["Backout plan"], obj: "4.2" },
        { q: "This backup rule says: keep 3 copies of your data, on 2 different media types, with 1 copy offsite.",
          a: "3-2-1 backup rule", alt: ["3-2-1 rule", "321 rule"], obj: "4.3" },
        { q: "You find prohibited content on a user's machine. Name the first three actions of the incident response process.",
          a: "Report through proper channels, preserve the data/device (chain of custody), and document everything",
          alt: ["Report, preserve, document"], obj: "4.6" }
      ]
    }
  ],

  /* ================= ROUND 2 =================
     Not yet populated — the engine is fully wired for it.
     Planned coverage: Linux & macOS, Mobile OS Security, Windows
     Networking Config, Software Troubleshooting, Scripting & Remote
     Access, Communication & Professionalism.
     Add 6 categories x 5 clues here in the same format.          */
  round2: [],

  /* ================= FINAL FACE-OFF ================= */
  final: {
    category: "TROUBLESHOOTING METHODOLOGY",
    q: "List, IN ORDER, all six steps of CompTIA's best practice methodology for resolving problems.",
    a: "1) Identify the problem  2) Establish a theory of probable cause  3) Test the theory to determine cause  4) Establish a plan of action and implement the solution  5) Verify full system functionality and implement preventive measures  6) Document findings, actions, and outcomes",
    obj: "3.1 / 5.1"
  }
};
