export interface Person {
  id: string
  name: string
  avatar: string
}

const people: Person[] = [
  { id: "1", name: "Alex Chen", avatar: "alex" },
  { id: "2", name: "Sarah Johnson", avatar: "sarah" },
  { id: "3", name: "Mike Wilson", avatar: "mike" },
  { id: "4", name: "Emma Davis", avatar: "emma" },
  { id: "5", name: "James Brown", avatar: "james" },
]

export function getAllPeople(): Person[] {
  return people
}

export function getAvatarUrl(avatarId: string, size: number = 90): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${avatarId}&size=${size}`
}
