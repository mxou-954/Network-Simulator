from network.network import Network
from network.packet import Packet
from network.router import Router

network = Network()

while True:
    print("Choisissez un service : \n")
    print("""
        1. Ajouter un routeur
        2. Connecter deux routeurs (ajouter une route)
        3. Envoyer un paquet
        4. Afficher le réseau
        5. Quitter
    \n""")
    choise = input()

    if choise == "1":
        print("Nom : ")
        router_name = input()

        print("id_address: ")
        ip_address = input()

        router = Router(router_name, ip_address)
        network.add_router(router)

    elif choise == "2":
        print("Routeur source (ip) : ")
        source_ip = input()

        print("Destination (ip) : ")
        destination_ip = input()

        print("Prochain saut (ip) : ")
        next_hop_ip = input()

        router = network.routers.find_by_ip(source_ip)
        if router is not None:
            router.add_route(destination_ip, next_hop_ip)
            print("Route ajoutée !")
        else:
            print("Routeur introuvable")

    elif choise == "3":
        print("Routeur source (ip) : ")
        source_ip = input()

        print("Destination (ip) : ")
        destination_ip = input()

        print("Payload : ")
        payload = input()

        packet = Packet(source_ip, destination_ip, payload)
        network.send_packet(packet)
        network.process_packets()

    elif choise == "4":
        network.routers.display()

    else:
        print("A bientôt !")
        break
