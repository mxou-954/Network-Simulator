from structures.routing_table import RoutingTable


class Router:
    def __init__(self, name, ip_address):
        self.name = name
        self.ip_address = ip_address
        self.routing_table = RoutingTable()

    def __str__(self):
        return f"{self.name} ({self.ip_address})"

    def add_route(self, destination, next_hop):
        self.routing_table.add_route(destination, next_hop)

    def get_next_hop(self, destination):
        return self.routing_table.get_route(destination)

    def display(self):
        return {
            "name": self.name,
            "ip_address": self.ip_address,
            "routing_table": self.routing_table.routes,
        }
