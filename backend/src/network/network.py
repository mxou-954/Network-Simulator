from structures.linked_list import LinkedList
from structures.queue import Queue
from structures.stack import Stack


class Network:
    def __init__(self):
        self.routers = LinkedList()
        self.packages_pending = Queue()

    def add_router(self, router):
        self.routers.add_node(router)

    def find_router(self, ip):
        router = self.routers.find_by_ip(ip)
        if router is not None:
            return router
        else:
            return None

    def send_packet(self, packet):
        self.packages_pending.enqueue(packet)

    def process_packets(self):
        packet = self.packages_pending.dequeue()
        if packet is None:
            return

        path = Stack()
        current_ip = packet.ip_source  # on commence ici

        while current_ip != packet.destination:
            packet.ttl -= 1
            if packet.ttl <= 0:
                print("Paquet perdu (TTL expiré)")
                return

            path.push(current_ip)

            router = self.find_router(current_ip)
            if router is None:
                print("Routeur introuvable")
                return
            elif router.is_active is False:
                print("Le routeur a subi des domages")
                return

            next_ip = router.get_next_hop(packet.destination)
            if next_ip is None:
                print("Pas de route trouvée")
                return

            current_ip = next_ip  # on saute au routeur suivant

        print("Paquet arrivé à destination !")
        path.push(packet.destination)

        complete_path = []
        while path.top is not None:
            iter = path.pop()
            complete_path.append(iter)

        complete_path.reverse()
        return complete_path
