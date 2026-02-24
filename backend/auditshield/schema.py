"""
Root GraphQL schema — wires together all queries and mutations.
"""
import strawberry
from auditshield.graphql.queries import Query
from auditshield.graphql.mutations import Mutation

schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    # Extensions can be added here (e.g. query depth limiting, cost analysis)
    extensions=[],
)
