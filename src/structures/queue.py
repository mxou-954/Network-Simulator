from network.node import Node 

class Queue:
    def __init__(self):
        self.front = None    # le premier de la file (celui qui sort)
        self.rear = None     # le dernier de la file (celui qui vient d'arriver)
    
    def enqueue(self, data):
        new_node = Node(data)
        if self.front is None:
            self.front = new_node
            self.rear = new_node
        else:
            self.rear.next = new_node   # on accroche après le dernier
            self.rear = new_node  

    def dequeue(self): 
        if self.front is None : 
            print("Il n'y a pas de packets dans la queue")
            return 

        data = self.front.data       # on sauvegarde la valeur
        self.front = self.front.next # on avance d'un cran
        return data                  # on retourne la valeur