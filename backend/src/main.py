from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from network.network import Network
from network.packet import Packet
from network.router import Router

app = FastAPI()
network = Network()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/routers")
def add_router(name: str, ip_address: str):
    router = Router(name, ip_address)
    network.add_router(router)
    return {"message": f"Routeur {name} ajouté !"}


@app.get("/routers")
def get_routers():
    routers = []
    current = network.routers.head
    while current is not None:
        routers.append(current.data.display())
        current = current.next
    return routers


@app.post("/routes")
def add_route(source_ip: str, destination_ip: str, next_hop_ip: str):
    router = network.find_router(source_ip)
    if router is None:
        return {"error": "Routeur introuvable"}
    router.add_route(destination_ip, next_hop_ip)
    return {"message": "Route ajoutée !"}


@app.post("/packets")
def send_packet(source_ip: str, destination_ip: str, payload: str):
    packet = Packet(source_ip, destination_ip, payload)
    network.send_packet(packet)
    path = network.process_packets()
    print(f"main.py : packet : {packet}, path : {path}")
    return {"path": path}
