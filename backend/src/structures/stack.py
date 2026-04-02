from network.node import Node 

class Stack:
    def __init__(self):
        self.top = None

    def push(self, data):
        new_node = Node(data)
        new_node.next = self.top    # le nouveau pointe vers l'ancien sommet
        self.top = new_node         # il devient le nouveau sommet

    def pop(self):
        if self.top is None:
            print("La pile est vide")
            return
        data = self.top.data         # on sauvegarde la valeur
        self.top = self.top.next     # on descend d'un cran
        return data                  # on retourne la valeur