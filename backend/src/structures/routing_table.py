class RoutingTable:
    def __init__(self):
        self.routes = []    # tableau simple

    def add_route(self, destination, next_hop):
        self.routes.append({"destination": destination, "next_hop": next_hop})

    def get_route(self, destination):
        for route in self.routes:
            if route["destination"] == destination:
                return route["next_hop"]
        return None