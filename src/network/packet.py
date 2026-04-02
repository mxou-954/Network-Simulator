class Packet:
    def __init__(self, ip_source, destination, payload):
        self.ip_source = ip_source
        self.destination = destination
        self.payload = payload
        self.ttl = 10

    def display(self):
        return {
            "ip_source": self.ip_source,
            "destination": self.destination,
            "payload": self.payload,
            "ttl": self.ttl,
        }
