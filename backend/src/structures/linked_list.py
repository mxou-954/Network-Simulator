from network.node import Node


class LinkedList:
    def __init__(self):
        self.head = None  # le premier nœud de la chaîne

    def add_node(self, data):
        new_node = Node(data)
        if self.head is None:
            self.head = new_node
        else:
            current = self.head
            while current.next is not None:
                current = current.next
            current.next = new_node

    def edit_node(self, data, newData):
        current = self.head
        while current is not None:
            if current.data == data:
                current.data = newData
                return
            else:
                current = current.next

    def display(self):
        current = self.head
        while current is not None:
            print(current.data)
            current = current.next

    def remove(self, data):
        current = self.head
        previous = None

        while current is not None:
            if current.data == data:
                if previous is None:
                    self.head = current.next
                else:
                    previous.next = current.next
                return
            else:
                previous = current
                current = current.next

    def find(self, data):
        current = self.head
        while current is not None:
            if current.data == data:
                return True
            else:
                current = current.next
        return False

    def find_by_ip(self, ip):
        current = self.head
        while current is not None:
            if current.data.ip_address == ip:
                return current.data  # retourne le Router
            else:
                current = current.next
        return None
