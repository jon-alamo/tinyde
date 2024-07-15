
import click
from tinyde.webapp import run_app

@click.command()
@click.option('--port', default=5001, help='Port for the web service.')
@click.option('--title', default='tinyde', help='Title for the web application.')
def cli(port, title):
    """Command line interface for tinyde."""
    run_app(port, title)


if __name__ == '__main__':
    cli()

