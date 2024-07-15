import click
from tinyde.webapp import run_app

@click.command()
@click.option('--port', default=5001, help='Port for the web service.')
def cli(port):
    """Command line interface for tinyde."""
    run_app(port)


if __name__ == '__main__':
    cli()
