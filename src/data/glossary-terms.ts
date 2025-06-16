import type { LucideIcon } from 'lucide-react';
import { ShieldAlert, KeyRound, Shuffle, Route, Computer, ServerCrash, UserX, MessageSquareWarning, Fingerprint, FileLock } from 'lucide-react';

export type GlossaryTerm = {
  id: string;
  term: string;
  definition: string;
  category: string;
  icon: LucideIcon;
};

export const glossaryTerms: GlossaryTerm[] = [
  {
    id: '1',
    term: 'Phishing',
    definition: 'A fraudulent attempt to obtain sensitive information such as usernames, passwords, and credit card details by disguising as a trustworthy entity in an electronic communication.',
    category: 'Cyber Attacks',
    icon: UserX,
  },
  {
    id: '2',
    term: 'DDoS (Distributed Denial of Service)',
    definition: 'An attack where multiple compromised computer systems attack a target, such as a server, website or other network resource, and cause a denial of service for users of the targeted resource.',
    category: 'Cyber Attacks',
    icon: ServerCrash,
  },
  {
    id: '3',
    term: 'Malware',
    definition: 'Software specifically designed to disrupt, damage, or gain unauthorized access to a computer system. Examples include viruses, worms, trojan horses, ransomware, and spyware.',
    category: 'Cyber Attacks',
    icon: ShieldAlert,
  },
  {
    id: '4',
    term: 'Ransomware',
    definition: 'A type of malware that threatens to publish the victim\'s data or perpetually block access to it unless a ransom is paid.',
    category: 'Cyber Attacks',
    icon: FileLock,
  },
  {
    id: '5',
    term: 'IT Act, 2000',
    definition: 'The Information Technology Act, 2000 is the primary law in India dealing with cybercrime and electronic commerce. It provides legal recognition for transactions carried out by means of electronic data interchange.',
    category: 'Indian Cyber Law',
    icon: Fingerprint,
  },
  {
    id: '6',
    term: 'Section 66C (IT Act)',
    definition: 'Punishment for identity theft. Whoever, fraudulently or dishonestly make use of the electronic signature, password or any other unique identification feature of any other person, shall be punished.',
    category: 'Indian Cyber Law',
    icon: KeyRound,
  },
  {
    id: '7',
    term: 'VPN (Virtual Private Network)',
    definition: 'A technology that creates a safe and encrypted connection over a less secure network, such as the public internet. VPNs can be used to access region-restricted websites, shield your browsing activity from prying eyes on public Wi-Fi, and more.',
    category: 'Security Concepts',
    icon: Route,
  },
  {
    id: '8',
    term: 'Encryption',
    definition: 'The process of converting information or data into a code, especially to prevent unauthorized access.',
    category: 'Security Concepts',
    icon: Shuffle,
  },
  {
    id: '9',
    term: 'Firewall',
    definition: 'A network security system that monitors and controls incoming and outgoing network traffic based on predetermined security rules. Firewalls typically establish a barrier between a trusted internal network and untrusted external network, such as the Internet.',
    category: 'Security Concepts',
    icon: Computer,
  },
  {
    id: '10',
    term: 'Social Engineering',
    definition: 'The use of deception to manipulate individuals into divulging confidential or personal information that may be used for fraudulent purposes.',
    category: 'Cyber Attacks',
    icon: MessageSquareWarning,
  }
];
